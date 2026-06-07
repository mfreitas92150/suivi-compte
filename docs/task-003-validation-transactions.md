# Task 003: Notion de Validation des Transactions

## Objectif
Ajouter la notion de "Validé" (pointage) aux transactions pour permettre à l'utilisateur de marquer les opérations qui ont été confirmées sur son relevé bancaire.

## Détails Fonctionnels
- Une transaction peut être marquée comme "Validée" ou "Non Validée".
- Dans la liste des transactions, une icône ou une checkbox permet de basculer cet état.
- Visuellement, une transaction validée doit être distinguable (ex: opacité réduite, icône de validation verte, etc.).
- Lors de la création d'une transaction, celle-ci est par défaut "Non Validée".

## Détails Techniques
- Utiliser le champ existant `checked` dans le modèle Prisma `Transaction`.
- Mettre à jour les Use Cases si nécessaire (normalement déjà géré par les Partial).
- Mettre à jour l'interface utilisateur `src/app/transactions/page.tsx` pour :
    - Afficher une colonne de validation.
    - Appeler `handleToggleChecked` lors du clic.
- S'assurer que le champ `checked` est bien renvoyé par l'API.

## Critères d'Acceptation
- [x] Une checkbox ou icône est visible pour chaque transaction dans la liste.
- [x] Cliquer sur cette icône change l'état en base de données (persistance).
- [x] L'état visuel change immédiatement après le clic (via React Query invalidation).
- [x] Les nouvelles transactions sont créées avec `checked: false`.

