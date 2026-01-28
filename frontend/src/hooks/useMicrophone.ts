import { useState, useCallback, useRef, useEffect } from 'react';

// Types
export interface MicrophoneState {
  isCapturing: boolean;
  isMuted: boolean;
  volume: number;
  audioLevel: number; // 0-100 for VU meter
  error: string | null;
  errorType: 'permission' | 'device' | 'browser' | 'https' | null;
  deviceId: string | null;
  devices: MediaDeviceInfo[];
  hasDevices: boolean | null; // null = not checked, true = has devices, false = no devices
}

export interface UseMicrophoneOptions {
  autoGainControl?: boolean;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  onAudioLevel?: (level: number) => void;
}

export interface UseMicrophoneReturn {
  state: MicrophoneState;
  checkDevices: () => Promise<{ hasDevices: boolean; devices: MediaDeviceInfo[] }>;
  startCapture: () => Promise<boolean>;
  stopCapture: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setDevice: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<MediaDeviceInfo[]>;
  audioStream: MediaStream | null;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
}

const initialState: MicrophoneState = {
  isCapturing: false,
  isMuted: false,
  volume: 100,
  audioLevel: 0,
  error: null,
  errorType: null,
  deviceId: null,
  devices: [],
  hasDevices: null,
};

/**
 * Hook for capturing microphone audio with VU meter
 */
export function useMicrophone(options: UseMicrophoneOptions = {}): UseMicrophoneReturn {
  const {
    autoGainControl = true,
    echoCancellation = true,
    noiseSuppression = true,
    onAudioLevel,
  } = options;

  const [state, setState] = useState<MicrophoneState>(initialState);
  
  // Refs for audio processing
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<MicrophoneState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if HTTPS is required (getUserMedia needs secure context)
  const checkSecureContext = useCallback((): boolean => {
    const isSecure = window.isSecureContext || 
                     location.protocol === 'https:' || 
                     location.hostname === 'localhost' ||
                     location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      console.warn('[WebRTC] ⚠️ Non-secure context detected. getUserMedia requires HTTPS.');
      updateState({ 
        error: 'Le microphone nécessite une connexion HTTPS. Utilisez un lien sécurisé.',
        errorType: 'https'
      });
    }
    return isSecure;
  }, [updateState]);

  // Check for available audio input devices BEFORE requesting permission
  const checkDevices = useCallback(async (): Promise<{ hasDevices: boolean; devices: MediaDeviceInfo[] }> => {
    console.log('[WebRTC] Checking available audio devices...');
    
    // Check secure context first
    if (!checkSecureContext()) {
      return { hasDevices: false, devices: [] };
    }
    
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error('[WebRTC] ❌ Browser does not support mediaDevices API');
      updateState({ 
        error: 'Votre navigateur ne supporte pas l\'accès au microphone.',
        errorType: 'browser',
        hasDevices: false
      });
      return { hasDevices: false, devices: [] };
    }

    try {
      // First, request temporary permission to get real device labels
      // Some browsers return empty labels until permission is granted
      let tempStream: MediaStream | null = null;
      try {
        tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[WebRTC] ✅ Temporary permission granted for device enumeration');
      } catch (permErr) {
        console.log('[WebRTC] Could not get temp permission, will check devices anyway');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      
      // Release temporary stream
      if (tempStream) {
        tempStream.getTracks().forEach(track => track.stop());
      }
      
      console.log('[WebRTC] Found audio input devices:', audioInputs.length, audioInputs.map(d => d.label || d.deviceId));
      
      const hasDevices = audioInputs.length > 0;
      
      updateState({ 
        devices: audioInputs, 
        hasDevices,
        error: hasDevices ? null : 'Aucun microphone détecté. Vérifiez les permissions de votre navigateur (icône cadenas).',
        errorType: hasDevices ? null : 'device'
      });
      
      return { hasDevices, devices: audioInputs };
    } catch (err) {
      console.error('[WebRTC] ❌ Failed to check devices:', err);
      updateState({ 
        error: 'Impossible de vérifier les périphériques audio.',
        errorType: 'browser',
        hasDevices: false 
      });
      return { hasDevices: false, devices: [] };
    }
  }, [updateState, checkSecureContext]);

  // Refresh available audio devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      updateState({ devices: audioInputs, hasDevices: audioInputs.length > 0 });
      return audioInputs;
    } catch (err) {
      console.error('[WebRTC] Failed to enumerate devices:', err);
      updateState({ error: 'Impossible de lister les microphones', errorType: 'browser' });
      return [];
    }
  }, [updateState]);

  // Calculate audio level from analyser data
  const calculateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for better VU meter
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const level = Math.min(100, Math.round((rms / 128) * 100));

    updateState({ audioLevel: level });
    onAudioLevel?.(level);

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(calculateAudioLevel);
  }, [onAudioLevel, updateState]);

  // Start capturing audio
  const startCapture = useCallback(async (): Promise<boolean> => {
    console.log('[WebRTC] Starting audio capture...');
    
    // Check secure context first
    if (!checkSecureContext()) {
      return false;
    }
    
    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      updateState({ 
        error: 'Votre navigateur ne supporte pas la capture audio.',
        errorType: 'browser'
      });
      return false;
    }

    // Check for devices first if not already done
    if (state.hasDevices === null) {
      const { hasDevices } = await checkDevices();
      if (!hasDevices) {
        return false;
      }
    } else if (state.hasDevices === false) {
      updateState({ 
        error: 'Aucun microphone détecté. Vérifiez les permissions de votre navigateur (icône cadenas).',
        errorType: 'device'
      });
      return false;
    }

    try {
      updateState({ error: null, errorType: null });

      // Request microphone access with robust constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          autoGainControl,
          echoCancellation,
          noiseSuppression,
          deviceId: state.deviceId ? { exact: state.deviceId } : undefined,
        },
      };

      console.log('[WebRTC] Requesting microphone access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log('[WebRTC] ✅ Stream obtained:', stream.id);

      // Create audio context and nodes
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = state.volume / 100;
      gainNodeRef.current = gainNode;

      // Create analyser for VU meter
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect nodes: source -> gain -> analyser
      source.connect(gainNode);
      gainNode.connect(analyser);
      // Note: We don't connect to destination to avoid feedback
      // The stream is available for WebRTC transmission

      // Start VU meter animation
      calculateAudioLevel();

      // Get device ID from track
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();

      updateState({
        isCapturing: true,
        isMuted: false,
        deviceId: settings.deviceId || null,
        hasDevices: true,
      });

      console.log('[WebRTC] ✅ Capture started:', audioTrack.label);
      
      // Refresh devices list
      await refreshDevices();

      return true;
    } catch (err) {
      console.error('[WebRTC] ❌ Capture failed:', err);
      
      let errorMessage = 'Erreur lors de l\'accès au microphone.';
      let errorType: MicrophoneState['errorType'] = 'browser';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Accès au microphone refusé. Cliquez sur l\'icône cadenas 🔒 dans la barre d\'adresse pour autoriser l\'accès.';
          errorType = 'permission';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'Aucun microphone détecté. Vérifiez que votre micro est branché et les permissions du navigateur.';
          errorType = 'device';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Le microphone est utilisé par une autre application. Fermez-la et réessayez.';
          errorType = 'device';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Le microphone sélectionné n\'est plus disponible. Essayez un autre appareil.';
          errorType = 'device';
        } else if (err.name === 'SecurityError') {
          errorMessage = 'Erreur de sécurité. Le microphone nécessite une connexion HTTPS.';
          errorType = 'https';
        }
      }

      updateState({ error: errorMessage, errorType, isCapturing: false });
      return false;
    }
  }, [
    autoGainControl,
    echoCancellation,
    noiseSuppression,
    state.deviceId,
    state.volume,
    state.hasDevices,
    updateState,
    calculateAudioLevel,
    refreshDevices,
    checkDevices,
    checkSecureContext,
  ]);

  // Stop capturing audio
  const stopCapture = useCallback(() => {
    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear refs
    analyserRef.current = null;
    gainNodeRef.current = null;
    sourceRef.current = null;

    updateState({
      isCapturing: false,
      audioLevel: 0,
    });

    console.log('[MIC] Capture stopped');
  }, [updateState]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        updateState({ isMuted: !audioTrack.enabled });
        console.log('[MIC] Muted:', !audioTrack.enabled);
      }
    }
  }, [updateState]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume / 100;
    }
    
    updateState({ volume: clampedVolume });
  }, [updateState]);

  // Change device
  const setDevice = useCallback(async (deviceId: string) => {
    updateState({ deviceId });
    
    // If already capturing, restart with new device
    if (state.isCapturing) {
      stopCapture();
      await startCapture();
    }
  }, [state.isCapturing, stopCapture, startCapture, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  return {
    state,
    checkDevices,
    startCapture,
    stopCapture,
    toggleMute,
    setVolume,
    setDevice,
    refreshDevices,
    audioStream: streamRef.current,
    audioContext: audioContextRef.current,
    gainNode: gainNodeRef.current,
  };
}

export default useMicrophone;
