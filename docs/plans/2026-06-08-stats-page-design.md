# Conception de la Page de Statistiques Annuelles

## Objectif
Créer une nouvelle page dédiée aux statistiques annuelles pour visualiser l'évolution des revenus et des dépenses sur une année complète.

## Interface et Navigation
- **URL de la page** : `/stats`
- **Navigation** : Ajout d'un lien "Statistiques" (icône BarChart) dans le composant `DashboardLayout.tsx` (sidebar et potentiellement navigation mobile).
- **En-tête** : 
  - Titre : "Statistiques Annuelles".
  - Sélecteur : Un sélecteur dynamique pour choisir l'année (par défaut l'année en cours).
- **Contenu Principal** : 
  - Un graphique principal utilisant `Recharts` (BarChart).
  - Axe X : Les 12 mois de l'année.
  - Axe Y : Les montants en euros.
  - Séries : Deux barres par mois, l'une pour les Revenus (vert), l'autre pour les Dépenses (rouge/orange).
  - Un tableau récapitulatif ou des cartes de KPI (Total Revenus, Total Dépenses, Balance Annuelle) pourront être ajoutés sous le graphique pour plus de clarté.

## Données et Backend
- **API** : Création d'une nouvelle route `GET /api/stats/annual?year=YYYY`.
  - Cette route interrogera la base de données via Prisma pour récupérer toutes les transactions de l'année spécifiée.
  - Elle agrégera les données mois par mois pour calculer la somme des transactions de type `INCOME` et `EXPENSE` (en filtrant les transactions internes si nécessaire).
- **Hook Frontend** : Création d'un hook `useAnnualStats(year)` dans `useApi.ts` utilisant React Query pour récupérer et mettre en cache ces données.

## Sécurité
- La route API sera protégée par l'authentification Clerk, tout comme les autres routes de l'application.