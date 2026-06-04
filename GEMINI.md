# SuiviCompte - Instructions & Architecture

Application de suivi de budget partagée pour couple, conçue pour remplacer un fichier Excel complexe. L'application privilégie la confidentialité (hébergement local sur NAS) et la simplicité d'usage hybride (PC/Mobile).

## Architecture du Projet

Le projet suit les principes de la **Clean Architecture** (Architecture Hexagonale) pour garantir le découpage entre la logique métier et l'infrastructure technique.

### Structure des Dossiers
- `src/core/domain` : Entités métier (Transaction, Account, Envelope) et règles pures.
- `src/core/ports` : Interfaces définissant les contrats pour les services externes (Repositories).
- `src/core/application` : Cas d'usage (ex: `CreateTransaction`, `GetDashboardStats`).
- `src/infrastructure` : Implémentations techniques (Prisma, SQLite).
- `src/app/api` : Backend RESTful exposant les cas d'usage via des endpoints JSON.
- `src/presentation` : Frontend React/Next.js consommant exclusivement les API REST.

## Stack Technique
- **Frontend/Backend** : Next.js (App Router) hébergé sur **Vercel**.
- **Base de données** : **Turso** (LibSQL), compatible SQLite.
- **ORM** : Prisma avec adaptateur LibSQL.
- **State Management** : React Query (TanStack Query) pour la synchronisation API.
- **Styling** : Tailwind CSS + Lucide React.
- **Graphiques** : Recharts.

## Déploiement (Vercel + Turso)

L'application est déployée automatiquement via Vercel à chaque push sur la branche principale.

### Configuration requise
1.  **Turso** : Créer une base de données et récupérer l'URL et le Token.
2.  **Vercel** : Configurer les variables d'environnement suivantes :
    *   `TURSO_DATABASE_URL` : URL de la base (ex: `libsql://...`)
    *   `TURSO_AUTH_TOKEN` : Token d'authentification.
    *   `DATABASE_URL` : Utiliser `file:./dev.db` pour Prisma CLI ou l'URL Turso si nécessaire.

### Procédure de mise à jour du schéma
1.  Modifier `prisma/schema.prisma`.
2.  Générer le client : `npx prisma generate`.
3.  Pousser les changements sur Turso : `npx prisma db push`.

## Règles de Développement
- **Découpage strict** : Ne jamais appeler Prisma directement depuis les composants ou Server Actions. Passer systématiquement par un Cas d'Usage et une Interface de Repository.
- **Mobile-First** : Toute nouvelle fonctionnalité de saisie doit avoir une interface simplifiée pour smartphone.
- **Données Sensibles** : Les secrets et URLs de base de données doivent rester dans le fichier `.env` (non committé).

## Commandes Utiles
- `npm run dev` : Lancer en mode développement.
- `npx prisma migrate dev` : Appliquer les changements de schéma à la base SQLite.
- `npx tsx prisma/seed.ts` : Réinitialiser les données de base (catégories, comptes).
