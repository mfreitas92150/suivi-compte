# Règles de Gestion et de Calcul - Tableau de Pilotage Budgétaire

Ce document détaille la logique métier et les formules de calcul utilisées dans l'écran de Pilotage de l'application SuiviCompte.

## 1. Trésorerie Actuelle
La trésorerie représente l'argent réellement disponible sur les comptes bancaires à l'instant T.
- **Source** : Somme des soldes de tous les comptes enregistrés en base de données (`Account`).
- **Formule** : `Total Trésorerie = Σ(Solde de chaque compte)`

## 2. Revenus et Charges (Fixes & Exceptionnels)
Ces blocs fonctionnent comme des listes de pointage interactives pour suivre les flux d'argent prévus sur le mois.

### Logique de Pointage (Checkbox)
- **Décoché (Non réalisé)** : L'opération est considérée comme **"À venir"**. Elle impacte le calcul du Reste à Vivre car elle anticipe un mouvement futur.
- **Coché (Réalisé)** : L'opération est considérée comme **"Traitée"**. On part du principe que son montant est désormais déjà reflété dans le solde réel de la **Trésorerie Actuelle**. Elle n'impacte donc plus le calcul du Reste à Vivre pour éviter les doubles comptes.

### Formules des Totaux
- **Encaissements à venir** : Somme des montants de tous les revenus (fixes + exceptionnels) **décochés**.
- **Décaissements à venir** : Somme des montants de toutes les charges (fixes + exceptionnels) **décochées**.

## 3. Reste à Vivre Actuel
C'est l'indicateur clé du pilotage. Il représente l'argent qui restera réellement une fois que toutes les opérations prévues du mois seront passées.
- **Formule** : `Reste à Vivre = Total Trésorerie + Encaissements à venir - Décaissements à venir`

## 4. Suivi des Enveloppes Budgétaires
Cette section gère la répartition de l'argent disponible pour les dépenses variables.

### Préparation Mensuelle (Budget Théorique)
- **Budget à ventiler** : Somme de tous les revenus fixes théoriques - Somme de toutes les charges fixes théoriques. 
  *(Note: Ici on utilise les totaux théoriques, que les cases soient cochées ou non, pour définir l'enveloppe globale du mois).*
- **Reste après ventilation** : `Budget à ventiler - Σ(Budgets alloués à chaque enveloppe)`.

### Budgets Restants (Suivi Réel)
- **Dispo réel actuel** : Équivalent au **Reste à Vivre Actuel**.
- **Calcul par Enveloppe** : `Montant restant = Budget alloué - Σ(Transactions réelles du mois pour cette catégorie)`.
- **Indicateurs visuels** :
    - **Bleu** : Dépenses dans la limite du budget.
    - **Rouge** : Dépassement du budget alloué.
