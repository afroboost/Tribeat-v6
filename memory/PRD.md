# Beattribe - Product Requirements Document

## Vision
**"Unite Through Rhythm"** - Application d'écoute musicale synchronisée en temps réel.

## État Actuel - Supabase Connecté

### ✅ Corrections appliquées (27 Jan 2026)
- **Bug "body stream already read"** : CORRIGÉ - Utilisation de `fetch` direct au lieu du SDK
- **Messages d'erreur dynamiques** : Affichage de l'erreur exacte Supabase
- **Instructions RLS** : Affichées automatiquement en console si erreur 404/403

## Configuration Supabase Storage

### ⚠️ Action requise : Créer le bucket

1. **Allez sur** : https://supabase.com/dashboard/project/tfghpbgbtpgrjlhomlvz/storage

2. **Créez le bucket** :
   - Cliquez "New Bucket"
   - Name: `audio-tracks`
   - Public: ✅ OUI
   - File size limit: 50MB

3. **Ajoutez les policies** (SQL Editor) :

```sql
-- Autoriser les uploads anonymes
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'audio-tracks');

-- Autoriser la lecture publique
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'audio-tracks');

-- Autoriser la suppression (optionnel)
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'audio-tracks');
```

## Architecture Upload (Corrigée)

```javascript
// supabaseClient.ts - Utilise fetch direct
const response = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'apikey': supabaseAnonKey,
    'Content-Type': file.type,
  },
  body: file,
});

// Une seule lecture du stream
const responseText = await response.text();
```

## Messages d'erreur dynamiques

| Status | Message affiché |
|--------|-----------------|
| 404 | "Bucket introuvable. Créez-le dans Supabase Dashboard." |
| 403 | "Permission refusée. Activez l'accès public dans les policies." |
| 413 | "Fichier trop volumineux." |
| Autre | Message exact de Supabase |

## Checklist Corrigée

- [x] Une seule lecture du stream de réponse
- [x] Ajout du titre à la playlist locale après succès
- [x] Logs clairs sur le statut du bucket
- [x] Build réussi sans erreurs
- [ ] Test upload réel (en attente de création du bucket)

## Credentials
- **Supabase URL**: https://tfghpbgbtpgrjlhomlvz.supabase.co
- **Bucket**: audio-tracks (à créer)
- **Admin**: `/admin` → MDP: `BEATTRIBE2026`

---
*Dernière mise à jour: 27 Jan 2026 - Bug upload corrigé*
