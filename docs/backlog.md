# Backlog d'idées à implémenter

Ce document recense les idées d'amélioration et les nouvelles fonctionnalités à implémenter dans SuiviCompte.

## Navigation & UX

### 1. Bouton "Aujourd'hui" dans le sélecteur de date
- **Objectif** : Permettre à l'utilisateur de revenir rapidement au mois et à l'année en cours depuis n'importe quelle vue filtrée par date.
- **Détails Fonctionnels** : Ajouter un bouton (ex: icône "Home" ou texte "Aujourd'hui") dans le dropdown du sélecteur de date.
- **Détails Techniques** :
    - Localiser le sélecteur de date (présent dans `TransactionsPage`, `PilotagePage`, etc.).
    - Utiliser `setDate(new Date())` via le hook `useMonthNavigation`.
    - Idéalement, refactoriser le sélecteur de date en un composant réutilisable pour éviter la duplication.
- **Critères d'Acceptation** :
    - Le bouton est visible et facilement accessible dans le sélecteur de date.
    - Cliquer sur le bouton met à jour l'URL avec le mois et l'année actuels.
    - L'interface se met à jour pour afficher les données du mois courant.

### 2. Changement de l'icône de l'application
- **Objectif** : Personnaliser l'identité visuelle de l'application avec un logo propre plutôt que les icônes par défaut de Next.js.
- **Détails Fonctionnels** : Remplacer le favicon et éventuellement ajouter des icônes pour les différents formats (Apple Touch Icon, Android, etc.).
- **Détails Techniques** :
    - Créer ou récupérer un logo au format SVG/PNG.
    - Remplacer `src/app/favicon.ico`.
    - Mettre à jour les métadonnées dans `src/app/layout.tsx` si nécessaire pour gérer les différentes tailles d'icônes.
- **Critères d'Acceptation** :
    - L'onglet du navigateur affiche la nouvelle icône.
    - L'icône est nette sur les différents types d'écrans (Retina/High DPI).

### 3. Refonte visuelle et ergonomique globale (UI/UX Overhaul)
- **Objectif** : Améliorer la lisibilité, l'esthétique et l'expérience utilisateur globale de l'application.
- **Détails Fonctionnels** : 
    - Revoir la typographie (choix de polices plus modernes et lisibles).
    - Harmoniser la taille des blocs, les marges (spacing) et les arrondis (border-radius).
    - Clarifier la hiérarchie visuelle pour mettre en avant les informations cruciales (soldes, alertes).
- **Détails Techniques** :
    - Centraliser les variables de design (couleurs, espacements) dans `tailwind.config.ts` ou un fichier CSS global.
    - Standardiser les composants de base (Card, Button, Input) pour garantir la cohérence.
    - Tester différents contrastes pour l'accessibilité.
- **Critères d'Acceptation** :
    - L'interface paraît plus moderne et moins "chargée".
    - La navigation entre les pages est visuellement cohérente.
    - Les données importantes sont identifiables en un coup d'œil.

---
*Note : Pour chaque idée majeure, une tâche détaillée (task-XXX.md) devrait être créée lors de la phase de conception.*
