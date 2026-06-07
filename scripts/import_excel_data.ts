import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Début de l\'importation des données Excel ---');

    // 1. Nettoyage de la base de données
    console.log('Nettoyage de la base de données...');
    await prisma.transaction.deleteMany();
    await prisma.monthlyItem.deleteMany();
    await prisma.envelope.deleteMany();
    await prisma.recurringTransaction.deleteMany();
    await prisma.expenseGroup.deleteMany();
    await prisma.category.deleteMany();
    await prisma.account.deleteMany();
    await prisma.savings.deleteMany();
    await prisma.medicalTracking.deleteMany();

    // 2. Création des comptes
    console.log('Création des comptes...');
    const accounts = {
        'BP': await prisma.account.create({ data: { name: 'Banque Postale', type: 'CHECKING', balance: 4665.87 } }),
        'LivretBP': await prisma.account.create({ data: { name: 'Livret BP', type: 'SAVINGS', balance: 15048.57 } }),
        'Bourso': await prisma.account.create({ data: { name: 'Bourso x2', type: 'CHECKING', balance: 21869.60 } }),
    };
    const defaultAccount = accounts['BP'];

    // 3. Lecture du fichier Excel
    const excelFilePath = path.join(process.cwd(), 'docs', 'Copie de Suivi Comptes_2026.xlsm');
    const workbook = XLSX.readFile(excelFilePath);

    // 4. Importation des catégories et des transactions via SYNTHESE DEPENSES
    console.log('Importation des catégories et transactions (SYNTHESE DEPENSES)...');
    const synthSheet = workbook.Sheets['SYNTHESE DEPENSES'];
    const synthData: any[] = XLSX.utils.sheet_to_json(synthSheet);

    const categoriesMap = new Map<string, any>();
    const monthsMap: Record<string, number> = {
        'JANVIER': 1, 'FEVRIER': 2, 'MARS': 3, 'AVRIL': 4, 'MAI': 5, 'JUIN': 6,
        'JUILLET': 7, 'AOUT': 8, 'SEPTEMBRE': 9, 'OCTOBRE': 10, 'NOVEMBRE': 11, 'DECEMBRE': 12
    };

    const currentMonthLimit = 6; // On s'arrête à Juin 2026 comme demandé

    for (const row of synthData) {
        const monthStr = row['MOIS'];
        const month = monthsMap[monthStr];
        
        if (!month || month > currentMonthLimit) continue;

        const categoryName = row['Catégorie'] || 'Divers';
        if (!categoriesMap.has(categoryName)) {
            const category = await prisma.category.create({
                data: { name: categoryName, type: 'EXPENSE' }
            });
            categoriesMap.set(categoryName, category);
        }
        const category = categoriesMap.get(categoryName);

        // Conversion date Excel (nombre) en Date JS
        const transactionDate = row['Date'] ? new Date((row['Date'] - 25569) * 86400 * 1000) : new Date(2026, month - 1, 1);
        
        await prisma.transaction.create({
            data: {
                description: row['Libellé'] || 'Sans description',
                amount: row['Montant'] || row[' Montant dépensé '] || 0,
                date: transactionDate,
                accountId: defaultAccount.id,
                categoryId: category.id,
                isFixed: false
            }
        });
    }

    // 5. Importation des Charges Fixes, Revenus et Enveloppes par mois
    console.log('Importation des éléments mensuels et enveloppes...');
    const monthsToImport = ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN'];
    
    for (const monthName of monthsToImport) {
        const month = monthsMap[monthName];
        const sheet = workbook.Sheets[monthName];
        if (!sheet) continue;

        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Importation des enveloppes (budgets) - Situées à partir de la ligne 10, colonne K/L dans l'analyse précédente
        // On va plutôt chercher les labels dans le bloc Enveloppes (Ligne 11 à 24 env)
        for (let i = 10; i < 25; i++) {
            const row = data[i];
            if (row && row[13] && typeof row[14] === 'number') { // Col N (index 13) et Col O (index 14)
                const catName = row[13].trim();
                const budget = row[14];

                if (!categoriesMap.has(catName)) {
                    const category = await prisma.category.create({
                        data: { name: catName, type: 'EXPENSE' }
                    });
                    categoriesMap.set(catName, category);
                }
                const category = categoriesMap.get(catName);

                await prisma.envelope.create({
                    data: {
                        categoryId: category.id,
                        amount: budget,
                        month: month,
                        year: 2026
                    }
                }).catch(() => {}); // Éviter les doublons si déjà créé
            }
        }

        // Importation des Revenus Fixes (Col A/B)
        for (let i = 11; i < 20; i++) {
            const row = data[i];
            if (row && row[0] && typeof row[1] === 'number' && row[1] !== 0) {
                await prisma.monthlyItem.create({
                    data: {
                        label: row[0],
                        amount: row[1],
                        type: 'INCOME',
                        month: month,
                        year: 2026,
                        checked: row[2] === true || row[2] === 'TRUE'
                    }
                }).catch(() => {});
            }
        }

        // Importation des Charges Fixes (Col F/G)
        for (let i = 11; i < 30; i++) {
            const row = data[i];
            if (row && row[5] && typeof row[6] === 'number' && row[6] !== 0) {
                await prisma.monthlyItem.create({
                    data: {
                        label: row[5],
                        amount: row[6],
                        type: 'EXPENSE',
                        month: month,
                        year: 2026,
                        checked: row[7] === true || row[7] === 'TRUE'
                    }
                }).catch(() => {});
            }
        }
    }

    console.log('--- Importation terminée avec succès ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
