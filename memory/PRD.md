# Beattribe - Product Requirements Document

## Énoncé du problème original
Créer "Beattribe", une application web pour des sessions d'écoute musicale synchronisée en temps réel. Un "Host" contrôle une playlist pour des "Participants" connectés.

## Exigences fonctionnelles

### 1. Fonctionnalités principales (Core Features)
- Session d'écoute avec code de partage unique
- Playlist drag-and-drop
- Synchronisation en temps réel (Supabase Realtime)
- Upload de fichiers MP3 vers Supabase Storage
- Contrôle du volume par participant

### 2. Voice Chat (WebRTC)
- Communication vocale Host → Participants via PeerJS
- Ducking du volume musique pendant la parole

### 3. Monétisation (Stripe)
- Plans: Free, Pro, Enterprise
- Limites d'upload par plan
- Admin bypass illimité

### 4. Authentification (Supabase Auth)
- Email/Password
- Google OAuth
- Admin bypass pour `contact.artboost@gmail.com`

### 5. Admin CMS
- Gestion du nom, slogan, couleurs du site
- Persistance via table `site_settings` (avec fallback defaults)

### 6. PWA (Progressive Web App)
- Installable sur PC/Mobile
- Service Worker pour cache offline
- manifest.json configuré

---

## Ce qui a été implémenté

### Session 28 Janvier 2025

#### ✅ P0 - Réparation Upload MP3
- **Avant**: Erreur "Failed to execute 'json' on 'Response': body stream already read"
- **Correction**: Remplacé `fetch` natif par SDK Supabase `supabase.storage.from().upload()`
- **Fichier**: `/app/frontend/src/lib/supabaseClient.ts`
- **Status**: TESTÉ ET FONCTIONNEL

#### ✅ PWA - App installable
- Créé `/app/frontend/public/manifest.json`
- Créé `/app/frontend/public/sw.js` (Service Worker)
- Créé icônes SVG (`icon-192.svg`, `icon-512.svg`)
- Ajouté meta tags PWA dans `index.html`
- Enregistrement Service Worker dans `App.tsx`
- **Status**: TESTÉ ET FONCTIONNEL

#### ✅ UI - Suppression "Explorer les beats"
- Lien déjà supprimé de `HeroSection.tsx`
- **Status**: VÉRIFIÉ

#### ✅ CMS Fallback
- Hook `useSiteSettings` utilise `maybeSingle()` avec try/catch
- Valeurs par défaut si table absente
- **Status**: TESTÉ ET FONCTIONNEL

---

## Architecture technique

```
/app/frontend/
├── public/
│   ├── index.html (+ meta PWA)
│   ├── manifest.json ✅ NEW
│   ├── sw.js ✅ NEW
│   ├── icon-192.svg ✅ NEW
│   └── icon-512.svg ✅ NEW
├── src/
│   ├── lib/supabaseClient.ts ✅ UPDATED (SDK upload)
│   ├── components/
│   │   ├── audio/TrackUploader.tsx
│   │   └── sections/HeroSection.tsx
│   ├── context/AuthContext.tsx
│   ├── hooks/useSiteSettings.ts
│   ├── pages/
│   │   ├── SessionPage.tsx
│   │   └── admin/Dashboard.tsx
│   └── App.tsx ✅ UPDATED (SW registration)
```

---

## Backlog / Tâches futures

### P1 - Haute priorité
- [ ] Convertir composants UI `.jsx` → `.tsx`
- [ ] Confirmer exécution des scripts SQL Supabase (`supabase-setup.sql`, `supabase-site-settings.sql`)

### P2 - Moyenne priorité
- [ ] Implémenter "Request to Speak" pour participants
- [ ] Gestion du pseudo du Host
- [ ] Persister thème UI via Supabase au lieu de localStorage

### P3 - Basse priorité
- [ ] Refactoriser `SessionPage.tsx` (composant trop volumineux)
- [ ] Convertir icônes PWA SVG → PNG pour meilleure compatibilité

---

## Intégrations tierces
- **Supabase**: Auth, Realtime, Storage
- **PeerJS**: WebRTC voice streaming
- **@dnd-kit/core**: Drag-and-drop playlist
- **Stripe**: Payment (frontend ready, backend pending)

---

## Credentials de test
- **Admin**: `contact.artboost@gmail.com` (bypass automatique)
- **URL Preview**: https://music-tribe-2.preview.emergentagent.com

---

## Notes importantes
- ⚠️ NE PAS TOUCHER au flux WebRTC/micro (stable)
- ⚠️ Utiliser EXCLUSIVEMENT le SDK Supabase pour Storage (pas de fetch natif)
- ⚠️ Tables SQL doivent être créées par l'utilisateur dans Supabase Dashboard
