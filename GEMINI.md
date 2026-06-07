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

## Sécurité et Authentification

L'application utilise **Clerk** comme solution d'IAM (Identity and Access Management) pour sécuriser l'accès aux données.

### Principes de Sécurité
- **Authentification** : Gérée par Clerk via le App Router de Next.js.
- **Protection des Routes** : Un middleware Next.js (`src/middleware.ts`) bloque l'accès aux pages et aux API par défaut pour les utilisateurs non authentifiés.
- **Protection de l'API** : Chaque point de terminaison d'API doit valider la session via `auth()` de Clerk.
- **Utilisateurs autorisés** : Seuls les comptes explicitement autorisés (ou via une whitelist d'emails dans le dashboard Clerk) peuvent accéder aux données.

### Configuration requise (.env)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

## Stack Technique
- **Frontend/Backend** : Next.js (App Router) hébergé sur **Vercel**.
- **Sécurité** : **Clerk** (Authentification et gestion des sessions).
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

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
