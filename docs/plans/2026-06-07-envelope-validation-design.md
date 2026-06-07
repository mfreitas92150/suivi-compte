# Design: Notion de Dépenses Validées et à Venir dans les Enveloppes

## Objectif
Permettre une réconciliation précise entre le budget des enveloppes et la réalité bancaire. L'utilisateur doit voir immédiatement ce qui a été "réellement" dépensé (confirmé en banque) versus ce qui est "prévu" (dépenses saisies mais pas encore validées).

## Architecture & Logique de Calcul

### Données d'entrée
- **Budget Alloué (B)** : Défini dans l'enveloppe du mois.
- **Transactions (T)** : Liste des transactions du mois pour la catégorie associée.
  - **Transactions Validées (Tv)** : `checked === true`
  - **Transactions à Venir (Ta)** : `checked === false`

### Formules
1. **Dépensé Réel (Dr)** = Somme(Tv.amount)
2. **Dépensé Prévisionnel (Dp)** = Somme(Tv.amount + Ta.amount)
3. **Reste Réel (Rr)** = Budget - Dr
4. **Reste Prévisionnel (Rp)** = Budget - Dp

## Composants UI

### Écran de Pilotage (`src/app/pilotage/page.tsx`)
Modification de la ligne d'enveloppe pour afficher :
- **Montant Principal (Reste Réel)** : Le montant le plus visible, représentant l'argent physiquement disponible en banque par rapport à l'enveloppe.
- **Montant Secondaire (Reste Prévisionnel)** : Affiché en plus petit (ex: "Rp: 45,00 €"), représentant ce qu'il restera une fois toutes les dépenses validées.
- **Indicateur de statut** : Si Dr != Dp, une petite icône ou un code couleur indique qu'il y a des opérations en attente.

### Barre de Progression
- **Segment 1 (Solide)** : Dépenses validées.
- **Segment 2 (Hachuré ou Opacité réduite)** : Dépenses à venir.
- **Reste** : Espace vide.

## Flux de Données
1. Le `useMemo` qui calcule `envelopesSummary` dans `PilotagePage` (ou composant équivalent) doit être mis à jour pour calculer les deux sommes (validé vs total).
2. L'interface React affiche les deux valeurs avec une hiérarchie visuelle claire (Réel en priorité).

## Validation du Design
- L'utilisateur voit en priorité ce qui est "sûr".
- Il garde une vision de ce qui va bientôt être débité.
- Cohérence avec le système de "charges" déjà présent dans le pilotage.
