# Design Document : Version Mobile Focus (Saisie & Enveloppes)

**Date :** 2026-06-07
**Statut :** Validé par l'utilisateur

## 1. Objectif
Simplifier l'expérience mobile pour deux cas d'usage critiques au quotidien :
1.  **Saisie Rapide :** Enregistrer une dépense en quelques secondes au moment de l'achat.
2.  **Consultation des Enveloppes :** Savoir instantanément combien il reste dans chaque budget.

## 2. Architecture & Navigation

### Point d'entrée : `/mobile`
Une nouvelle page racine servira de conteneur principal. Elle gérera l'onglet actif via un état local (`saisie` ou `enveloppes`).

### Navigation : `MobileNavigation` (Tabs)
Une barre de navigation fixe en bas de l'écran (`fixed bottom-0`).
- **Styles :** Fond blanc, flou d'arrière-plan (backdrop-blur), bordure supérieure fine.
- **Éléments :**
    - **Bouton Saisie** (Icône `PlusCircle` ou `Receipt`) : Accès au formulaire.
    - **Bouton Enveloppes** (Icône `Target` ou `Wallet`) : Accès aux budgets.
- **État :** Mise en avant visuelle (couleur bleue) de l'onglet actif.

## 3. Détails des Vues

### Vue "Saisie Rapide"
- **Montant :** Affichage en très grand en haut de l'écran. Focus automatique et clavier numérique par défaut.
- **Description :** Champ texte simple.
- **Sélection Catégorie/Compte :** Utilisation de "Chips" (boutons) plutôt que des menus déroulants pour une sélection rapide au pouce.
- **Date :** Aujourd'hui par défaut, avec bouton rapide pour "Hier".
- **Action :** Large bouton "Enregistrer" fixé au-dessus de la barre de navigation.

### Vue "Enveloppes"
- **Reste à dépenser :** Résumé global très visible en haut.
- **Liste des Enveloppes :** Cartes compactes avec :
    - Nom de la catégorie et solde restant en gras.
    - Jauge de progression visuelle (Bleu -> Orange -> Rouge).
- **Filtre :** Sélecteur de mois discret (par défaut sur le mois en cours).

## 4. Détails Techniques
- **Hooks :** Utilisation intensive de `useApi.ts` (React Query) pour les données (comptes, catégories, enveloppes, transactions).
- **Composants :**
    - `src/app/mobile/page.tsx` : Conteneur principal.
    - `src/presentation/components/mobile/MobileNavigation.tsx`.
    - `src/presentation/components/mobile/MobileEntryForm.tsx`.
    - `src/presentation/components/mobile/MobileEnvelopeList.tsx`.
- **Responsive :** Cette vue est optimisée pour le mobile mais accessible sur desktop via l'URL `/mobile`.

## 5. Critères d'Acceptation
- [ ] Navigation fluide entre les deux onglets.
- [ ] Possibilité d'ajouter une transaction complète depuis l'onglet Saisie.
- [ ] Visualisation correcte des jauges de budget dans l'onglet Enveloppes.
- [ ] Interface ergonomique pour une utilisation à une main.
