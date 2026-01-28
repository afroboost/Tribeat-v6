# Beattribe - Product Requirements Document

## Vision
**"Unite Through Rhythm"** - Application d'écoute musicale synchronisée en temps réel.

## État Actuel - Autoplay 100% Fonctionnel

### ✅ Enchaînement Automatique (28 Jan 2026)

#### Comportement Hôte
1. À la fin d'une piste, `handleTrackEnded` est appelé
2. Calcul du prochain index : `(currentIndex + 1) % tracks.length`
3. Mise à jour locale + `autoPlayPending` pour forcer la lecture
4. Broadcast `syncPlaylist` + `syncPlayback` vers les participants
5. Toast "Enchaînement : [Titre]"

#### Comportement Participant
1. Réception de `SYNC_PLAYBACK` via Supabase Realtime
2. Changement de piste via `setSelectedTrack`
3. Force `audio.play()` via `document.querySelector('audio')`
4. Toast "Enchaînement : [Titre]"

### Modes de Répétition

| Mode | Fin de piste | Fin de playlist |
|------|--------------|-----------------|
| none | → Suivant | ⏹ Toast "Fin de la playlist" |
| all | → Suivant | 🔄 Retour au premier |
| one | 🔂 Rejoue | 🔂 Rejoue |

### Architecture Technique

```typescript
// SessionPage.tsx - Force auto-play après changement
const [autoPlayPending, setAutoPlayPending] = useState<string | null>(null);

useEffect(() => {
  if (autoPlayPending && selectedTrack.src === autoPlayPending) {
    setTimeout(() => {
      const audioEl = document.querySelector('audio');
      audioEl?.play();
      setAutoPlayPending(null);
    }, 150);
  }
}, [autoPlayPending, selectedTrack.src]);

// handleTrackEnded - Broadcast aux participants
if (nextTrack) {
  setSelectedTrack(nextTrack);
  setAutoPlayPending(nextTrack.src);
  socket.syncPlaylist(tracks, nextTrack.id);
  socket.syncPlayback(true, 0, nextTrack.id);
}

// Participant - Réception et auto-play
socket.onPlaybackSync((payload) => {
  const targetTrack = tracks.find(t => t.id === payload.trackId);
  if (targetTrack) {
    setSelectedTrack(targetTrack);
    setTimeout(() => {
      document.querySelector('audio')?.play();
    }, 100);
  }
});
```

### Checklist Anti-Casse

- [x] **TrackUploader.tsx** : NON MODIFIÉ ✅
- [x] **Config Supabase** : NON MODIFIÉ ✅
- [x] **Styles** : Conservés ✅
- [x] **Cleanup** : Event listeners nettoyés ✅
- [x] **Playlist vide** : Gestion du cas ✅
- [x] **Build réussi** : `yarn build` OK ✅

### Test de Régression

- [x] Upload MP3 fonctionne
- [x] Playlist drag & drop OK
- [x] Modération OK
- [x] Répétition OK
- [x] Toast affiché

## Configuration

```env
REACT_APP_SUPABASE_URL=https://tfghpbgbtpgrjlhomlvz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_***
REACT_APP_SUPABASE_BUCKET=audio-tracks
```

## Test Multi-Appareils

1. **PC (Hôte)** : https://beattribe-live.preview.emergentagent.com/session
2. **Mobile (Participant)** : Ouvrir le lien de partage
3. **Lancer la lecture** sur PC
4. **Laisser la piste finir** → Le mobile doit changer automatiquement

## Credentials
- **Admin**: `/admin` → MDP: `BEATTRIBE2026`

---
*Dernière mise à jour: 28 Jan 2026 - Autoplay multi-appareils 100% fonctionnel*
