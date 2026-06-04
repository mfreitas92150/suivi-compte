# Task: Mise en place de la sécurité et authentification

## Objectif
Sécuriser l'accès à l'application pour s'assurer que seuls les utilisateurs autorisés (le couple) peuvent consulter et modifier les données financières.

## Détails Fonctionnels
- **Page de Connexion :** Une interface permettant de s'authentifier avant d'accéder aux fonctionnalités de l'application.
- **Gestion des Sessions :** Rester connecté pendant une période définie.
- **Déconnexion :** Possibilité de se déconnecter manuellement.
- **Protection des Routes :** Toutes les pages (sauf la page de connexion) doivent être inaccessibles sans authentification.
- **Protection de l'API :** Tous les points de terminaison de l'API doivent vérifier l'authentification.

## Détails Techniques
- **Framework :** Clerk (IAM) avec le SDK `@clerk/nextjs`.
- **Stratégie d'Authentification :** 
    - Authentification gérée par Clerk (Passwordless, Email/Password, ou OAuth).
    - Utilisation des composants Clerk (`<SignIn />`, `<UserButton />`) pour l'UI.
- **Middleware :** Implémentation de `src/middleware.ts` pour rediriger les flux non authentifiés.
- **Protection API :** Utilisation de `auth()` dans les Server Actions et les Route Handlers.

## Critères d'Acceptation
- [ ] Une page de connexion fonctionnelle est présente.
- [ ] Il est impossible d'accéder à `/transactions`, `/pilotage`, etc., sans être connecté.
- [ ] Les appels API échouent avec une erreur 401 si non authentifiés.
- [ ] Un bouton "Déconnexion" est disponible dans l'interface.
