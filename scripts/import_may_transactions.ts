import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseBoursoAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/"/g, '').replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned);
}

function parseLBPAmount(amountStr: string): number {
    const cleaned = amountStr.replace(',', '.');
    return parseFloat(cleaned);
}

const CATEGORY_MAPPING: Record<string, string> = {
    // Bourso CSV Categories
    'Alimentation': 'Courses / Alimentation',
    'Restaurants, bars, discothèques…': 'Loisirs & Sorties',
    'Loisirs et sorties': 'Loisirs & Sorties',
    'Mobilier, électroménager, décoration…': 'Maison & Déco',
    'Vêtements et accessoires': 'Shopping / Sport',
    'Transports quotidiens (métro, bus…)': 'Transport / Auto',
    'Carburant': 'Transport / Auto',
    'Virements reçus': 'Remboursements',
    // Default
    'default': 'Divers / Imprévus'
};

const KEYWORD_MAPPING: Record<string, string> = {
    'PHARMACIE': 'Santé',
    'AMAZON': 'Shopping / Sport',
    'SUPER U': 'Courses / Alimentation',
    'DECATHLON': 'Shopping / Sport',
    'HELLOFRESH': 'Courses / Alimentation',
    'CLIMB UP': 'Loisirs & Sorties',
    'EDF': 'Charges fixes',
    'ORANGE': 'Charges fixes',
    'SFR': 'Charges fixes',
    'FREE MOBILE': 'Charges fixes',
    'CAF': 'Remboursements',
    'CPAM': 'Remboursements',
    'BALOO': 'Remboursements',
};

async function getOrCreateCategory(name: string, type: 'EXPENSE' | 'INCOME' = 'EXPENSE') {
    let category = await prisma.category.findFirst({ where: { name } });
    if (!category) {
        category = await prisma.category.create({ data: { name, type } });
        console.log(`Catégorie créée : ${name}`);
    }
    return category;
}

async function main() {
    console.log('--- Début de l\'importation des transactions de Mai 2026 ---');

    const boursoAccount = await prisma.account.findFirst({ where: { name: 'Bourso Commun' } });
    const lbpAccount = await prisma.account.findFirst({ where: { name: 'LBP Commun' } });

    if (!boursoAccount || !lbpAccount) {
        console.error('Comptes introuvables. Veuillez vérifier les noms des comptes.');
        process.exit(1);
    }

    const boursoPath = path.join(process.cwd(), 'docs', 'export', 'bourso-08-06-2026_10-32-35.csv');
    const lbpPath = path.join(process.cwd(), 'docs', 'export', 'lbp-2955801S0291780907645288.csv');

    // Nettoyage préalable pour Mai 2026
    const startDate = new Date(2026, 4, 1);
    const endDate = new Date(2026, 5, 0, 23, 59, 59);
    
    const deletedCount = await prisma.transaction.deleteMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    });
    console.log(`${deletedCount.count} transactions existantes pour Mai 2026 ont été supprimées.`);

    const defaultCat = await getOrCreateCategory('Divers / Imprévus');

    // Process Bourso
    if (fs.existsSync(boursoPath)) {
        const content = fs.readFileSync(boursoPath, 'utf-8');
        const lines = content.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length < 7) continue;

            const dateOp = parts[0]; // YYYY-MM-DD
            if (!dateOp.startsWith('2026-05')) continue;

            const label = parts[2].replace(/"/g, '');
            const csvCategory = parts[4].replace(/"/g, '');
            const amount = parseBoursoAmount(parts[6]);

            let catName = CATEGORY_MAPPING[csvCategory] || CATEGORY_MAPPING['default'];
            
            // Check keywords for more precision
            for (const [kw, target] of Object.entries(KEYWORD_MAPPING)) {
                if (label.toUpperCase().includes(kw)) {
                    catName = target;
                    break;
                }
            }

            const category = await getOrCreateCategory(catName, amount > 0 ? 'INCOME' : 'EXPENSE');

            await prisma.transaction.create({
                data: {
                    date: new Date(dateOp),
                    description: label,
                    amount: amount,
                    accountId: boursoAccount.id,
                    categoryId: category.id,
                    isFixed: false,
                    checked: true
                }
            });
        }
    }

    // Process LBP
    if (fs.existsSync(lbpPath)) {
        const content = fs.readFileSync(lbpPath, 'latin1');
        const lines = content.split('\n');
        let dataStarted = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('Date;Libell')) {
                if (line.startsWith('Date;Libell')) dataStarted = true;
                continue;
            }
            if (!dataStarted) continue;

            const parts = line.split(';');
            if (parts.length < 3) continue;

            const dateStr = parts[0]; // DD/MM/YYYY
            const [day, month, year] = dateStr.split('/');
            if (month !== '05' || year !== '2026') continue;

            const label = parts[1].replace(/"/g, '');
            const amount = parseLBPAmount(parts[2]);

            let catName = CATEGORY_MAPPING['default'];
            for (const [kw, target] of Object.entries(KEYWORD_MAPPING)) {
                if (label.toUpperCase().includes(kw)) {
                    catName = target;
                    break;
                }
            }

            const category = await getOrCreateCategory(catName, amount > 0 ? 'INCOME' : 'EXPENSE');

            await prisma.transaction.create({
                data: {
                    date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
                    description: label,
                    amount: amount,
                    accountId: lbpAccount.id,
                    categoryId: category.id,
                    isFixed: false,
                    checked: true
                }
            });
        }
    }

    console.log('--- Importation terminée ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
