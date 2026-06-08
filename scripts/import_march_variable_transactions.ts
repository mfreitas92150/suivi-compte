import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/"/g, '').replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned);
}

const CATEGORY_MAPPING: Record<string, string> = {
    'Alimentation': 'Courses / Alimentation',
    'Restaurants, bars, discothèques…': 'Loisirs & Sorties',
    'Loisirs et sorties': 'Loisirs & Sorties',
    'Mobilier, électroménager, décoration…': 'Maison & Déco',
    'Vêtements et accessoires': 'Shopping / Sport',
    'Transports quotidiens (métro, bus…)': 'Transport / Auto',
    'Carburant': 'Transport / Auto',
    'Virements reçus': 'Remboursements',
    'default': 'Divers / Imprévus'
};

const KEYWORD_MAPPING: Record<string, string> = {
    'PHARMACIE': 'Santé',
    'AMAZON': 'Shopping / Sport',
    'SUPER U': 'Courses / Alimentation',
    'DECATHLON': 'Shopping / Sport',
    'HELLOFRESH': 'Courses / Alimentation',
    'CLIMB UP': 'Loisirs & Sorties',
    'CARREFOUR': 'Courses / Alimentation',
    'MONOPRIX': 'Courses / Alimentation',
    'KIABI': 'Shopping / Sport'
};

// Charges fixes (Idem précédents)
const FIXED_CHARGES_AMOUNTS = [
    1207.80, 494.12, 319.83, 272.00, 132.00, 70.00, 54.00,
    98.35, 82.73, 26.00, 50.55, 24.99, 7.99, 2.00,
    66.16, 48.92, 41.85, 44.29, 27.28, 222.80, 19.22, 13.80, 60.00
];

// Revenus de Mars
const INCOME_AMOUNTS = [
    3859.11, 2962.51, 128.00, 44.65, 500.00, 87.99, 1000.00, 7.96, 4.00, 61.03, 12.01, 36.00, 1300.00
];

// Mots-clés pour exclure les virements internes
const EXCLUDE_KEYWORDS = [
    'VIR SEPA MONDEJAR', 'Virement depuis BoursoBank', 'VIR Virement depuis COMPTE SUR LIVRE',
    'REGULARISATION SUITE DOUBLE IMPUTATION', 'VIREMENT DE MME MONDEJAR MORGANE THOMAS'
];

async function getOrCreateCategory(name: string, type: 'EXPENSE' | 'INCOME' = 'EXPENSE') {
    let category = await prisma.category.findFirst({ where: { name } });
    if (!category) {
        category = await prisma.category.create({ data: { name, type } });
    }
    return category;
}

function shouldExclude(amount: number, label: string): boolean {
    const absAmount = Math.abs(amount);
    
    if (FIXED_CHARGES_AMOUNTS.some(a => Math.abs(a - absAmount) < 0.05)) return true;
    if (INCOME_AMOUNTS.some(a => Math.abs(a - absAmount) < 0.05)) return true;

    const upperLabel = label.toUpperCase();
    if (EXCLUDE_KEYWORDS.some(kw => upperLabel.includes(kw.toUpperCase()))) return true;

    return false;
}

async function main() {
    console.log('--- Importation des transactions courantes de Mars 2026 ---');

    const boursoAccount = await prisma.account.findFirst({ where: { name: 'Bourso Commun' } });
    const lbpAccount = await prisma.account.findFirst({ where: { name: 'LBP Commun' } });

    if (!boursoAccount || !lbpAccount) {
        throw new Error('Comptes introuvables.');
    }

    const boursoPath = path.join(process.cwd(), 'docs', 'export', 'bourso-08-06-2026_10-32-35.csv');
    const lbpPath = path.join(process.cwd(), 'docs', 'export', 'lbp-2955801S0291780907645288.csv');

    let count = 0;

    // Boursorama
    if (fs.existsSync(boursoPath)) {
        const lines = fs.readFileSync(boursoPath, 'utf-8').split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length < 7) continue;

            const dateOp = parts[0];
            if (!dateOp.startsWith('2026-03')) continue;

            const label = parts[2].replace(/"/g, '');
            const csvCategory = parts[4].replace(/"/g, '');
            const amount = parseAmount(parts[6]);

            if (shouldExclude(amount, label)) continue;

            let catName = CATEGORY_MAPPING[csvCategory] || CATEGORY_MAPPING['default'];
            for (const [kw, target] of Object.entries(KEYWORD_MAPPING)) {
                if (label.toUpperCase().includes(kw)) {
                    catName = target;
                    break;
                }
            }

            const category = await getOrCreateCategory(catName, amount > 0 ? 'INCOME' : 'EXPENSE');

            const existing = await prisma.transaction.findFirst({
                where: {
                    date: new Date(dateOp),
                    description: label,
                    amount: amount,
                    accountId: boursoAccount.id
                }
            });

            if (!existing) {
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
                count++;
            }
        }
    }

    // LBP
    if (fs.existsSync(lbpPath)) {
        const lines = fs.readFileSync(lbpPath, 'latin1').split('\n');
        let dataStarted = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Date;Libell')) { dataStarted = true; continue; }
            if (!dataStarted || !trimmed) continue;

            const parts = trimmed.split(';');
            if (parts.length < 3) continue;

            const dateStr = parts[0];
            const [day, month, year] = dateStr.split('/');
            if (month !== '03' || year !== '2026') continue;

            const label = parts[1].replace(/"/g, '');
            const amount = parseAmount(parts[2]);

            if (shouldExclude(amount, label)) continue;

            let catName = CATEGORY_MAPPING['default'];
            for (const [kw, target] of Object.entries(KEYWORD_MAPPING)) {
                if (label.toUpperCase().includes(kw)) {
                    catName = target;
                    break;
                }
            }

            const category = await getOrCreateCategory(catName, amount > 0 ? 'INCOME' : 'EXPENSE');
            const transDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            const existing = await prisma.transaction.findFirst({
                where: {
                    date: transDate,
                    description: label,
                    amount: amount,
                    accountId: lbpAccount.id
                }
            });

            if (!existing) {
                await prisma.transaction.create({
                    data: {
                        date: transDate,
                        description: label,
                        amount: amount,
                        accountId: lbpAccount.id,
                        categoryId: category.id,
                        isFixed: false,
                        checked: true
                    }
                });
                count++;
            }
        }
    }

    console.log(`[OK] ${count} transactions courantes ont été importées pour Mars 2026.`);
    console.log('--- Fin de l\'importation ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
