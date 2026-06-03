# Task: Conception et Architecture du système de Suivi de Comptes

## Objectif
Développer une solution de suivi de comptes et de dépenses partagée pour un couple, remplaçant un fichier Excel complexe. La solution doit permettre une gestion par "enveloppes", offrir des statistiques annuelles et des graphiques, tout en étant accessible par les deux conjoints.

## Détails Fonctionnels
- **Gestion des Enveloppes :** Possibilité de définir des budgets mensuels par catégorie (alimentation, loisirs, etc.) et de suivre le solde restant.
- **Saisie des Transactions :** Interface simple pour ajouter des dépenses ou revenus, avec catégorie, date, montant et compte source.
- **Statistiques et Graphiques :**
    - Vue mensuelle et annuelle des dépenses par catégorie.
    - Évolution du solde des comptes.
    - Comparatif budget vs réel (enveloppes).
- **Accès Partagé :** Les deux utilisateurs doivent pouvoir consulter et modifier les données.
- **Multi-comptes :** Gestion de plusieurs comptes bancaires (compte joint, comptes personnels).

## Détails Techniques
- **Architecture :** Application Web Responsive (accessible sur mobile et desktop).
- **Frontend :** React ou Vue.js avec une bibliothèque de graphiques (ex: Chart.js ou Recharts).
- **Backend :** Node.js (Express) ou Python (FastAPI).
- **Base de données :** SQLite (pour la simplicité initiale) ou PostgreSQL.
- **Hébergement/Partage :** À définir (Auto-hébergé, Cloud type Fly.io/Railway, ou partage d'un fichier DB via un service de cloud type Dropbox/Nextcloud si solution légère).

## Critères d'Acceptation
- [ ] Le schéma de base de données permet de gérer les enveloppes, les transactions et les comptes.
- [ ] Une interface permet de visualiser les dépenses par mois sous forme de graphique.
- [ ] Le système gère les "enveloppes" avec un indicateur visuel de dépassement.
- [ ] Les données sont synchronisées entre les deux utilisateurs.
