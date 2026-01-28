# Beattribe - Product Requirements Document

## Vision
**"Unite Through Rhythm"** - Application d'écoute musicale synchronisée en temps réel.

## État Actuel - Autoplay & Sync Complets

### ✅ Fonctionnalités Autoplay (28 Jan 2026)

#### Enchaînement Automatique
- À la fin d'une piste, passage automatique au titre suivant
- Toast de feedback : "Piste suivante : [Titre]"
- Synchronisation avec tous les participants via Supabase

#### Modes de Répétition
| Mode | Comportement |
|------|--------------|
| none | Passe au suivant, s'arrête en fin de playlist |
| all | Boucle sur toute la playlist |
| one | Répète le titre en cours indéfiniment |

#### Broadcast Multi-Appareils
```typescript
// Hôte envoie aux participants
socket.syncPlaylist(tracks, nextTrack.id);  // Mise à jour playlist
socket.syncPlayback(true, 0, nextTrack.id); // Commande lecture
```

### Architecture Technique

```typescript
// useAudioSync.ts - Gestion de fin de piste
useEffect(() => {
  const handleEnded = () => {
    if (repeatMode === 'one') {
      audio.currentTime = 0;
      audio.play();
    } else {
      onTrackEnded?.(); // Parent gère le changement
    }
  };
  audio.addEventListener('ended', handleEnded);
  return () => audio.removeEventListener('ended', handleEnded);
}, [repeatMode, onTrackEnded]);

// SessionPage.tsx - Logique autoplay
const handleTrackEnded = useCallback(() => {
  if (!isHost) return;
  
  const currentIndex = tracks.findIndex(t => t.id === selectedTrack.id);
  let nextTrack = null;
  
  if (repeatMode === 'all') {
    nextTrack = tracks[(currentIndex + 1) % tracks.length];
  } else if (repeatMode === 'none' && currentIndex < tracks.length - 1) {
    nextTrack = tracks[currentIndex + 1];
  }
  
  if (nextTrack) {
    setSelectedTrack(nextTrack);
    showToast(`Piste suivante : ${nextTrack.title}`, 'success');
    socket.syncPlaylist(tracks, nextTrack.id);
    socket.syncPlayback(true, 0, nextTrack.id);
  }
}, [...]);
```

### Écoute Participants

```typescript
// SessionPage.tsx - Réception sync playlist
socket.onPlaylistSync((payload) => {
  setTracks(payload.tracks);
  const newSelected = payload.tracks.find(t => t.id === payload.selectedTrackId);
  if (newSelected) {
    setSelectedTrack(newSelected);
    showToast(`Piste suivante : ${newSelected.title}`, 'default');
  }
});

// Réception sync playback
socket.onPlaybackSync((payload) => {
  const targetTrack = tracks.find(t => t.id === payload.trackId);
  if (targetTrack) setSelectedTrack(targetTrack);
});
```

### Checklist Anti-Casse

- [x] **TrackUploader.tsx** : NON MODIFIÉ ✅
- [x] **Styles minimalistes** : stroke-width 1.5 conservé ✅
- [x] **Cleanup eventListeners** : `return () => removeEventListener` ✅
- [x] **Index sécurisé** : `% tracks.length` évite dépassement ✅
- [x] **Build réussi** : `npm run build` sans erreurs ✅

### Test de Régression

- [x] Upload MP3 fonctionne
- [x] Playlist drag & drop OK
- [x] Modération (mute/eject) OK
- [x] Répétition cycle OK (none → all → one)
- [x] Toast affiché lors du changement de piste

## Configuration

```env
REACT_APP_SUPABASE_URL=https://tfghpbgbtpgrjlhomlvz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_***
REACT_APP_SUPABASE_BUCKET=audio-tracks
```

## Credentials
- **Admin**: `/admin` → MDP: `BEATTRIBE2026`
- **Preview**: https://beattribe-live.preview.emergentagent.com

---
*Dernière mise à jour: 28 Jan 2026 - Autoplay multi-appareils complet*
