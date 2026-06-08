---
name: import-bank-export
description: Workflow étape par étape pour purger, valider et importer un mois de données financières à partir d'exports bancaires CSV (Boursorama, La Banque Postale), en séparant strictement le pilotage (revenus/charges fixes) des dépenses courantes.
---

# Skill : Importation des exports bancaires

Ce skill définit la procédure standard pour traiter les exports CSV mensuels et les intégrer proprement dans l'application SuiviCompte sans créer de doublons entre le tableau de pilotage (MonthlyItems) et les enveloppes budgétaires (Transactions).

## 🛠 Quand utiliser ce skill ?
- À chaque fin/début de mois lorsque l'utilisateur fournit de nouveaux fichiers CSV dans `docs/export/`.
- Lorsqu'on vous demande d'importer un mois spécifique.
- En cas de corruption des données d'un mois nécessitant une réinitialisation complète.

## 📋 Prérequis
- Les fichiers CSV doivent être présents dans le dossier `docs/export/`.
- Les noms typiques sont : `bourso-*.csv` et `lbp-*.csv`.
- Boursorama utilise le séparateur `;` et le format de date `YYYY-MM-DD`.
- LBP utilise le séparateur `;` (souvent encodé en latin1) et le format de date `DD/MM/YYYY`.

## 🔄 Workflow d'importation en 5 étapes

### Étape 1 : Purge Exhaustive du mois (OPTIONNELLE)
**⚠️ ATTENTION : Ne purgez jamais le mois sans demander explicitement l'autorisation à l'utilisateur au préalable.**
Si l'utilisateur confirme vouloir repartir de zéro pour le mois ciblé, exécutez le script de purge :
```bash
npx tsx scripts/purge_month.ts <mois> <année>
```
*Vérifiez que les Transactions, Enveloppes, MonthlyItems et Savings du mois ont bien été supprimés.*

### Étape 2 : Initialisation du mois (Intervention Utilisateur)
Demandez à l'utilisateur d'aller sur l'interface web (page Pilotage) pour **Initialiser le mois**.
Cette action générera les `MonthlyItem` théoriques (revenus et charges fixes) à partir des templates (`RecurringTransaction`).

### Étape 3 : Identification et Validation des Revenus
Recherchez dans les CSV les rentrées d'argent.
- **Salaires** : SWM (Mig) et Ponant (Momo).
- **Aides/Remboursements exceptionnels** : CAF, CPAM, Baloo, Sidecare.
Mettez à jour les `MonthlyItem` de type `INCOME` pour le mois en passant `checked: true`. 
*Créez de nouveaux `MonthlyItem` (INCOME) pour les revenus exceptionnels qui ne sont pas prévus dans les templates.*

### Étape 4 : Validation des Charges Fixes
Les charges fixes prévues existent maintenant sous forme de `MonthlyItem` (EXPENSE).
Recherchez leurs montants exacts (tolérance de ±0.05€) dans les exports CSV.
Mettez à jour les `MonthlyItem` correspondants avec `checked: true`.
*Mémorisez les montants exacts des charges fixes et des revenus trouvés pour l'étape suivante.*

### Étape 5 : Importation des Dépenses Courantes (Variables)
C'est la dernière étape. Vous devez importer les lignes restantes du CSV dans la table `Transaction`.
**⚠️ Règle de sécurité cruciale :**
Filtrez rigoureusement les lignes du CSV. **EXCLURE** toute transaction dont le montant correspond à un revenu ou une charge fixe validé aux étapes 3 et 4, ou contenant des mots-clés de virements internes.
*Les transactions importées ici imputeront directement les enveloppes budgétaires.*

## 💻 Scripts de référence disponibles
Vous pouvez vous inspirer ou adapter les scripts suivants créés historiquement dans le projet :
- `scripts/purge_month.ts` : Supprime toutes les données d'un mois.
- `scripts/analyze_incomes.ts` : Aide à lister les revenus d'un export.
- `scripts/validate_may_incomes.ts` : Exemple de validation de revenus.
- `scripts/validate_may_expenses.ts` : Exemple de rapprochement des charges fixes.
- `scripts/import_variable_transactions.ts` : Exemple de filtre intelligent pour n'importer que les dépenses courantes.