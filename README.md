# Protocole Summer Build

Site personnel pour suivre le **Protocole Summer Build** — checklist quotidienne, règles inviolables, séance maison V-Shape, agenda fitness, stats.

**100% local** : tout est stocké dans le navigateur (`localStorage`). Aucun compte, aucun serveur, fonctionne hors-ligne après le premier chargement.

---

## 🚀 Déployer sur GitHub Pages

> Le site est une app React (Create React App). On ne peut **pas** simplement pousser un `index.html` — il faut d'abord compiler (`yarn build`) puis publier le dossier `build/`. Tout est déjà configuré ci-dessous pour le faire **automatiquement** à chaque push.

### Option A — Déploiement automatique via GitHub Actions (recommandée)

1. **Crée un dépôt GitHub** (ex. `summer-build`) puis pousse ce projet dessus :
   ```bash
   cd /chemin/vers/le/projet
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/<ton-user>/summer-build.git
   git push -u origin main
   ```

2. Va sur ton dépôt GitHub → **Settings → Pages** → dans "Build and deployment" → **Source** : choisis **"GitHub Actions"**.

3. C'est tout. Le workflow `.github/workflows/deploy.yml` se lance à chaque `git push` sur `main`, compile l'app et publie. L'URL finale sera :
   ```
   https://<ton-user>.github.io/<nom-du-repo>/
   ```

4. Suivi en direct : onglet **Actions** de ton dépôt.

### Option B — Déploiement manuel depuis ta machine

Depuis n'importe quel terminal sur ta machine (Node 18+ et Yarn installés) :

```bash
cd frontend
yarn install
yarn deploy
```

Cela compile `frontend/build` puis le pousse sur la branche `gh-pages` de ton dépôt. Active ensuite dans **Settings → Pages** → Source : `Deploy from a branch` → `gh-pages` / `/(root)`.

---

## 🛠️ Pourquoi pas un simple `index.html` ?

React utilise JSX + ES modules + JSX/JSX transform + Tailwind, qui doivent passer par un **compilateur (Webpack/CRA/craco)**. Le fichier `frontend/public/index.html` est juste un **template** — c'est `yarn build` qui produit le `index.html` final + les bundles JS/CSS dans `frontend/build/`. C'est ce dossier `build` qui est publié sur GitHub Pages.

Bref : **tu pousses ton code source sur GitHub, GitHub Actions compile, GitHub Pages sert le résultat**. Tu n'as plus rien à faire après le premier setup.

---

## ⚙️ Configurations utiles déjà appliquées

- `package.json` : `"homepage": "."` → assets relatifs (marche peu importe l'URL de Pages)
- `App.js` : utilise `HashRouter` au lieu de `BrowserRouter` → pas besoin de configuration serveur pour le routing, pas de 404 sur reload
- `.github/workflows/deploy.yml` : build + deploy automatique sur push `main`
- `CI: false` dans le workflow : évite que des warnings React bloquent le build

---

## 🏃 Dev local

```bash
cd frontend
yarn install
yarn start
```

Le site démarre sur `http://localhost:3000`. Toutes les données sont dans `localStorage`, persistantes entre les refresh.

---

## 📦 Stack

- React 19, React Router (HashRouter), Tailwind, Shadcn UI primitives
- Animations : Framer Motion + canvas-confetti
- Audio Focus Mode : Web Audio API
- Export image : html-to-image
- Aucune dépendance backend en production

---

## ✅ Fonctionnalités

- Checklist quotidienne (7 tâches horodatées) avec reset auto à minuit
- Règles inviolables (5 règles)
- Séance Maison V-Shape avec **Focus Mode** plein écran (chrono, alertes audio, tutos images)
- Agenda hebdomadaire 7 jours (CrossFit 1h + calcul automatique des séances Maison selon la règle d'enchaînement)
- Alerte si tu ouvres le site pendant une séance CrossFit planifiée
- Stats : streak, record, moyenne 7 jours, barres 7 derniers jours
- Thème auto Clair/Sombre (clair 09:40→18:00)
- Export image 5 palettes pour les réseaux sociaux
- 100 % localStorage, fonctionne sans wifi après chargement initial
