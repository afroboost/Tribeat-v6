# Beattribe - Product Requirements Document

## Vision
**"Unite Through Rhythm"** - Application d'écoute musicale synchronisée en temps réel.

## Stack Technique
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build**: Create React App (CRA) avec CRACO
- **UI Components**: Shadcn/UI + Radix UI
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Routing**: react-router-dom v6
- **Storage**: LocalStorage (thème, pseudo)

## Fonctionnalités Implémentées

### ✅ Phase 1 - Core (Complété)
- [x] Design System Beattribe (couleurs, fonts, CSS variables)
- [x] Page d'accueil avec Hero Section
- [x] Formulaire "Créer/Rejoindre session"
- [x] Dashboard Admin protégé (/admin) - MDP: `BEATTRIBE2026`
- [x] Système de thème dynamique avec LocalStorage
- [x] Lecteur audio avec distinction Host/Participant
- [x] Modal de saisie de pseudo avec persistance
- [x] Routes dynamiques (/session/:sessionId)

### ✅ Phase 2 - Playlist & Modération (Complété - 25 Jan 2026)
- [x] **Playlist Drag & Drop** (10 titres max)
  - ScrollArea (max-h-400px) pour la playlist
  - Icône GripVertical pour le déplacement
  - Réorganisation fluide avec @dnd-kit
- [x] **Panel de Modération Participants**
  - Slider de volume miniature par participant
  - Bouton Mute/Unmute minimaliste
  - Bouton Eject (X) dans menu discret
- [x] **Contrôle Micro Hôte**
  - Slider de gain dans le header
  - Toggle Mute/Unmute
- [x] **Design sobre**
  - Icônes lucide-react (stroke-width 1.5)
  - Bordures fines (border-white/10)
  - Scrollbars ultra-fines/masquées

## Fichiers Clés
```
/app/frontend/src/
├── components/audio/
│   ├── AudioPlayer.tsx      # Lecteur principal
│   ├── PlaylistDnD.tsx      # Playlist Drag & Drop
│   ├── ParticipantControls.tsx  # Modération
│   └── HostMicControl.tsx   # Contrôle micro
├── components/ui/
│   ├── scroll-area.tsx      # Radix ScrollArea
│   └── slider.tsx           # Radix Slider
├── pages/SessionPage.tsx    # Page session complète
├── hooks/useAudioSync.ts    # Logique audio sync
└── styles/globals.css       # Design tokens
```

## Backlog (P1-P3)

### P0 - Priorité immédiate
- [ ] Synchronisation audio temps réel (WebSockets)

### P1 - Court terme
- [ ] Convertir shadcn/ui .jsx restants en .tsx
- [ ] Persistance backend du thème

### P2 - Moyen terme
- [ ] Pseudo "Coach" par défaut pour l'hôte
- [ ] Upload de fichiers audio personnalisés

### P3 - Long terme
- [ ] Authentification réelle
- [ ] Base de données pour sessions

## Credentials de Test
- **Admin**: /admin → MDP: `BEATTRIBE2026`
- **Session Host**: /session (créer nouvelle)
- **Session Participant**: /session/{id}

## Notes Techniques
- Hot reload activé
- Build: `npm run build`
- Sync audio = SIMULATION (console.log uniquement)
