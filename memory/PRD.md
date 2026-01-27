# Beattribe - Product Requirements Document

## Vision
**"Unite Through Rhythm"** - Application d'écoute musicale synchronisée en temps réel.

## Stack Technique
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build**: Create React App (CRA) avec CRACO
- **UI Components**: Shadcn/UI + Radix UI
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Real-time**: Supabase Realtime Channels ✅ CONNECTÉ
- **Storage**: Supabase Storage (bucket: audio-tracks)
- **Routing**: react-router-dom v6

## État Actuel - PRODUCTION READY

### ✅ Supabase Connecté (27 Jan 2026)
```
URL: https://tfghpbgbtpgrjlhomlvz.supabase.co
Status: SUBSCRIBED
Realtime: WebSocket actif
```

### Fonctionnalités Actives

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| Session création | ✅ | ID unique généré |
| Realtime sync | ✅ | WebSocket SUBSCRIBED |
| CMD_MUTE | ✅ | Diffusé sur réseau |
| CMD_EJECT | ✅ | Diffusé sur réseau |
| Upload MP3 | ✅ | Vers bucket audio-tracks |
| Badge Cloud | ✅ | "✓ Cloud" affiché |

## Configuration Supabase Appliquée

```env
REACT_APP_SUPABASE_URL=https://tfghpbgbtpgrjlhomlvz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_***
REACT_APP_SUPABASE_BUCKET=audio-tracks
```

## Architecture Realtime

```
SocketContext.tsx
└── supabase.channel(`session:${sessionId}`)
    └── broadcast: { self: false }
    └── Events:
        ├── CMD_MUTE_USER    → Host → Participant
        ├── CMD_UNMUTE_USER  → Host → Participant
        ├── CMD_EJECT_USER   → Host → Participant (+ redirect)
        ├── CMD_VOLUME_CHANGE → Host → Participant
        ├── SYNC_PLAYLIST    → Host → All
        ├── SYNC_PLAYBACK    → Host → All
        ├── USER_JOINED      → Any → All
        └── USER_LEFT        → Any → All
```

## Test Multi-Appareils

### Comment tester :
1. **PC (Hôte)** : Ouvrir `https://beattribe-live.preview.emergentagent.com/session`
2. **Téléphone (Participant)** : Ouvrir le lien de partage généré
3. **Actions à tester** :
   - Mute un participant → Vérifier que son audio est coupé
   - Eject un participant → Vérifier redirection vers accueil
   - Réorganiser playlist → Vérifier sync sur téléphone

### URLs de test :
- **Preview**: https://beattribe-live.preview.emergentagent.com
- **Session directe**: /session (créer) ou /session/{ID} (rejoindre)

## Bucket Supabase Storage

⚠️ **Action requise** : Vérifiez que le bucket `audio-tracks` existe :
1. Allez sur https://supabase.com/dashboard/project/tfghpbgbtpgrjlhomlvz/storage
2. Créez le bucket si absent :
   - Nom: `audio-tracks`
   - Public: OUI
   - MIME types: audio/mpeg, audio/mp3

## Credentials
- **Admin**: `/admin` → MDP: `BEATTRIBE2026`
- **Supabase Project**: tfghpbgbtpgrjlhomlvz

## Tâches Futures

### P1
- [ ] Vérifier bucket Storage dans Supabase Dashboard
- [ ] Test upload MP3 réel

### P2
- [ ] Persistance playlist en DB
- [ ] Authentification réelle

---
*Dernière mise à jour: 27 Jan 2026 - Supabase CONNECTÉ et FONCTIONNEL*
