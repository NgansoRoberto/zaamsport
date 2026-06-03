# Déploiement de ZaamSport sur Render

Ce document explique comment déployer l'application en production :
- **Frontend** sur Render (Static Site)
- **Backend** sur Render (Web Service Docker)
- **PostgreSQL + PostGIS** sur Neon ou Supabase
- **Images / uploads** sur Cloudflare R2

---

## 1. Préparation

### 1.1 Pousser le code sur GitHub/GitLab
Render se connecte à un dépôt Git pour récupérer le code.

```bash
git add .
git commit -m "Préparer pour déploiement Render"
git push origin main
```

---

## 2. Base de données PostgreSQL + PostGIS

### Option A : Neon (recommandé, gratuit)
1. Créer un compte sur https://neon.tech
2. Créer un projet (région la plus proche : Frankfurt EU ou similaire)
3. Aller dans **SQL Editor** et exécuter :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. Importer le schéma + les données :
   - Coller le contenu de `base de donnees/schema.sql` puis exécuter
   - Coller le contenu de `base de donnees/data.sql` puis exécuter
5. Récupérer la **connection string** (Dashboard → Connection details → "psql")
   Elle ressemble à :
   `postgres://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

### Option B : Supabase (gratuit alternatif)
Mêmes étapes, via https://supabase.com → Project Settings → Database → Connection string.

---

## 3. Cloudflare R2 (uploads d'images)

1. Créer un compte Cloudflare https://cloudflare.com et activer R2 (carte requise mais 10 GB gratuits)
2. **R2 → Create Bucket** : nom ex. `zaamsport-uploads`
3. **Settings → R2.dev subdomain** : activer l'accès public (URL `https://pub-XXX.r2.dev`)
   ou mieux : associer un sous-domaine custom (`images.votredomaine.com`)
4. **Manage R2 API Tokens** → créer un token avec permissions "Object Read & Write" sur ce bucket
5. Noter :
   - `R2_ENDPOINT` = `https://<accountid>.r2.cloudflarestorage.com`
   - `R2_BUCKET` = `zaamsport-uploads`
   - `R2_ACCESS_KEY_ID` et `R2_SECRET_ACCESS_KEY` du token
   - `R2_PUBLIC_URL` = `https://pub-XXX.r2.dev` ou votre sous-domaine

---

## 4. Déploiement sur Render

### Méthode rapide : Blueprint
Le fichier `render.yaml` à la racine décrit les 2 services.

1. Render Dashboard → **New + → Blueprint**
2. Connecter votre repo Git
3. Render détecte `render.yaml` et propose les services à créer
4. Pour chaque variable marquée `sync: false`, remplir la valeur (voir tableau ci-dessous)
5. Cliquer **Apply**

### Méthode manuelle (si vous préférez)

#### A. Web Service Docker (backend)
- New + → Web Service → Connect repo
- **Runtime** : Docker
- **Root Directory** : `backend`
- **Dockerfile Path** : `backend/Dockerfile`
- **Health Check Path** : `/health`
- Variables d'environnement (voir tableau ci-dessous)

#### B. Static Site (frontend)
- New + → Static Site → Connect repo
- **Build Command** : `npm ci && npm run build`
- **Publish Directory** : `dist`
- Variables d'environnement : `VITE_API_BASE_URL` = URL du backend
- **Redirects/Rewrites** : ajouter `/*` → `/index.html` (rewrite) pour le routage SPA

### Variables d'environnement à configurer

#### Backend (zaamsport-api)
| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Connection string Neon/Supabase (avec `?sslmode=require`) |
| `JWT_SECRET` | Auto-généré par Render (laisser `generateValue: true`) |
| `CORS_ORIGIN` | URL de votre frontend, ex. `https://zaamsport.com,https://www.zaamsport.com` |
| `STORAGE_DRIVER` | `r2` |
| `R2_ENDPOINT` | (voir section 3) |
| `R2_BUCKET` | (voir section 3) |
| `R2_ACCESS_KEY_ID` | (voir section 3) |
| `R2_SECRET_ACCESS_KEY` | (voir section 3) |
| `R2_PUBLIC_URL` | (voir section 3) |
| `APP_DEBUG` | `0` |

#### Frontend (zaamsport-web)
| Variable | Valeur |
|---|---|
| `VITE_API_BASE_URL` | URL publique du backend, ex. `https://zaamsport-api.onrender.com` |

> ⚠️ Pas de slash final dans `VITE_API_BASE_URL`. Pas de `/lamfunsport/api` à la fin (le code détecte automatiquement le préfixe).

---

## 5. Configuration du domaine custom

Une fois les services déployés (URLs `*.onrender.com` fonctionnelles) :

### 5.1 Sur Render
- **Static Site (frontend)** → **Settings → Custom Domain** → ajouter `votredomaine.com` ET `www.votredomaine.com`
- **Web Service (backend)** → **Settings → Custom Domain** → ajouter `api.votredomaine.com`

### 5.2 Chez votre registrar DNS
Render vous donne les enregistrements DNS à créer. Typiquement :
| Hôte | Type | Valeur |
|---|---|---|
| `@` (racine) | A | (IP fournie par Render) |
| `www` | CNAME | `votredomaine.com` ou cible Render |
| `api` | CNAME | `zaamsport-api.onrender.com` |

Les certificats SSL Let's Encrypt sont émis automatiquement par Render après propagation DNS (5–30 min).

### 5.3 Après activation du domaine
Mettre à jour la variable `CORS_ORIGIN` du backend pour inclure les domaines finaux.

---

## 6. Tests de validation

```bash
# Backend up ?
curl https://api.votredomaine.com/health
# → {"status":"ok"}

# DB connectée ?
curl "https://api.votredomaine.com/clubs?lat=4.05&lng=9.7&radius=15"
# → liste JSON (ou [])

# Frontend
# Ouvrir https://votredomaine.com et tester l'inscription/connexion
```

---

## 7. Coûts mensuels

| Service | Plan | Coût |
|---|---|---|
| Render Static Site | Free | 0 $ |
| Render Web Service (Docker) | Starter | 7 $ |
| Neon PostgreSQL | Free | 0 $ |
| Cloudflare R2 (10 GB) | Free | 0 $ |
| **TOTAL** | | **~7 $/mois** |

> Le plan **Free** du Web Service Render fonctionne aussi, mais le service s'endort après 15 min d'inactivité (~30 s de cold start au premier appel).

---

## 8. Notes de sécurité (à faire dès la mise en prod)

- [ ] Vérifier que `APP_DEBUG=0` en prod
- [ ] Vérifier que `JWT_SECRET` est bien aléatoire (>= 32 caractères)
- [ ] Restreindre `CORS_ORIGIN` à votre domaine uniquement (pas de `*`)
- [ ] Supprimer/protéger les fichiers de debug : `backend/api/info.php`, `text_hash.php`, `contollers/testerlescode.php`
- [ ] Retirer la "zone de test temporaire" qui leak le hash en cas de mauvais mot de passe ([Authcontroller.php:47-67](backend/api/contollers/Authcontroller.php:47))
- [ ] Empêcher l'auto-attribution du rôle `admin`/`manager` via `/register` (filtrer `role` côté serveur)
