import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/"/g, '').replace(/\s/g, '').replace(',', '.');
    return Math.abs(parseFloat(cleaned)); // We work with absolute values for comparison
}

async function validateMayExpenses() {
    console.log('--- Validation des charges fixes de Mai 2026 ---');

    const boursoPath = path.join(process.cwd(), 'docs', 'export', 'bourso-08-06-2026_10-32-35.csv');
    const lbpPath = path.join(process.cwd(), 'docs', 'export', 'lbp-2955801S0291780907645288.csv');

    // 1. Get expected fixed expenses for May
    const expectedItems = await prisma.monthlyItem.findMany({
        where: { month: 5, year: 2026, type: 'EXPENSE' }
    });

    const csvTransactions: { label: string, amount: number, date: string }[] = [];

    // Load Bourso transactions for May
    if (fs.existsSync(boursoPath)) {
        const lines = fs.readFileSync(boursoPath, 'utf-8').split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length < 7) continue;
            const date = parts[0];
            const label = parts[2].replace(/"/g, '');
            const amount = parseAmount(parts[6]);
            const isNegative = parts[6].includes('-');
            if (date.startsWith('2026-05') && isNegative) {
                csvTransactions.push({ label, amount, date });
            }
        }
    }

    // Load LBP transactions for May
    if (fs.existsSync(lbpPath)) {
        const lines = fs.readFileSync(lbpPath, 'latin1').split('\n');
        let started = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Date;Libell')) { started = true; continue; }
            if (!started) continue;
            const parts = trimmed.split(';');
            if (parts.length < 3) continue;
            const date = parts[0];
            const label = parts[1].replace(/"/g, '');
            const amount = parseAmount(parts[2]);
            const isNegative = parts[2].includes('-');
            if (date.includes('/05/2026') && isNegative) {
                const [d, m, y] = date.split('/');
                csvTransactions.push({ label, amount, date: `${y}-${m}-${d}` });
            }
        }
    }

    // 2. Match and validate
    for (const item of expectedItems) {
        // Search criteria: amount match (with small tolerance for rounding) and keyword in label
        const keywords = item.label.split(' ');
        const mainKeyword = keywords[0].toUpperCase();

        const match = csvTransactions.find(t => 
            Math.abs(t.amount - item.amount) < 0.05 && 
            (t.label.toUpperCase().includes(mainKeyword) || 
             (mainKeyword === 'PRÊT' && t.label.toUpperCase().includes('ECHEANCE')) ||
             (mainKeyword === 'LOA' && t.label.toUpperCase().includes('SANTANDER')))
        );

        if (match) {
            await prisma.monthlyItem.update({
                where: { id: item.id },
                data: { checked: true }
            });
            console.log(`[OK] ${item.label} (${item.amount}€) trouvé le ${match.date} : ${match.label}`);
        } else {
            console.log(`[ ] ${item.label} (${item.amount}€) non trouvé.`);
        }
    }

    console.log('--- Fin de la validation ---');
}

validateMayExpenses()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
