# Beattribe - Product Requirements Document

## Vision
**"Unite Through Rhythm"** - Application d'écoute musicale synchronisée en temps réel.

## État Actuel - SYSTÈME D'ABONNEMENT STRIPE ✅

### ✅ Implémentation Abonnement (28 Jan 2026)

#### Architecture Subscription
```
┌─────────────────────────────────────────────────┐
│                  ADMIN                          │
│  • Accès illimité (pas de paiement)             │
│  • Création sessions sans limite                │
│  • Upload 999 chansons                          │
│  • Badge "👑 Mode Admin"                        │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│             UTILISATEUR STANDARD                │
│  • Version d'essai : 1 chanson max              │
│  • Doit accepter CGU avant paiement             │
│  • Redirection Stripe pour abonnement           │
│  • Badge "🎵 Essai (1 titre)"                   │
└─────────────────────────────────────────────────┘
```

### Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `/context/SubscriptionContext.tsx` | Gestion état abonnement, rôle, CGU |
| `/pages/PricingPage.tsx` | Page des offres avec checkbox CGU |

### Plans Disponibles

| Plan | Prix | Limite Chansons |
|------|------|-----------------|
| Essai Gratuit | 0€ | 1 |
| Pro Mensuel | 9.99€/mois | 50 |
| Pro Annuel | 99.99€/an | 200 |
| Enterprise | 299.99€/an | Illimité |

### Fonctionnalités Implémentées

#### 1. Contexte SubscriptionContext
```typescript
const { isAdmin, canUploadTrack, trackLimit, acceptTerms } = useSubscription();

// Admin bypass toutes les limites
if (isAdmin) return true;

// Vérification limite d'upload
if (currentTrackCount >= trackLimit) {
  return false; // Bloqué
}
```

#### 2. Page Pricing (/pricing)
- Grille de 4 offres
- Badge "Plus populaire" sur Pro Mensuel
- Checkbox CGU obligatoire avant paiement
- Modal CGU complet

#### 3. Limitations TrackUploader
```typescript
{isTrialLimitReached && (
  <div className="bg-yellow-500/10">
    <Lock /> Limite de la version d'essai : 1 chanson max
    <Link to="/pricing">Voir les offres</Link>
  </div>
)}
```

#### 4. Badges UI
- Admin : "👑 Mode Admin" (violet)
- Abonné : "✓ Abonné {type}" (vert)
- Essai : "🎵 Essai (1 titre)" (jaune, cliquable → /pricing)

### Logique Admin (Privilège Total)
- `sessionStorage.bt_is_admin` stocké après connexion `/admin`
- SubscriptionContext vérifie ce flag
- Si admin → role='admin', subscription='enterprise', trackLimit=-1

### Checklist ✅
- [x] Exception 'admin' dans le garde de route
- [x] Checkbox CGU fonctionnelle
- [x] Limitation playlist dynamique selon rôle
- [x] Build `yarn build` réussi
- [x] WebRTC/Microphone NON MODIFIÉ ✅
- [x] Autoplay NON MODIFIÉ ✅

## Configuration Stripe (À Faire)

Pour activer les paiements :
1. Créer les Payment Links dans Stripe Dashboard
2. Ajouter dans Supabase `admin_config.stripe_links`:
```json
{
  "monthly": "https://buy.stripe.com/xxx",
  "yearly": "https://buy.stripe.com/yyy",
  "enterprise": "https://buy.stripe.com/zzz"
}
```

## Credentials
- **Admin**: `/admin` → MDP: `BEATTRIBE2026`
- **Pricing**: `/pricing`

## URLs
- **Accueil**: `/`
- **Session**: `/session` ou `/session/:id`
- **Admin**: `/admin`
- **Tarifs**: `/pricing`

## Tâches Restantes

### P1 - Configuration Stripe
- [ ] Créer Payment Links dans Stripe Dashboard
- [ ] Configurer table `admin_config` dans Supabase
- [ ] Webhook Stripe pour mettre à jour `subscription_status`

### P2 - Prochaines
- [ ] Table `profiles` Supabase avec champs subscription
- [ ] Authentification Supabase Auth
- [ ] Gestion résiliation/changement de plan

### P3 - Backlog
- [ ] Dashboard utilisateur (historique, factures)
- [ ] Analytics abonnements

---
*Dernière mise à jour: 28 Jan 2026 - Système d'abonnement Stripe + CGU*
