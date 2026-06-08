import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMarchIncomes() {
    console.log('--- Validation des revenus de Mars 2026 ---');

    // 1. Salaires
    const items = await prisma.monthlyItem.findMany({
        where: { month: 3, year: 2026, type: 'INCOME' }
    });

    for (const item of items) {
        if (item.label.includes('Mig') || item.label.includes('Momo')) {
            const realAmount = item.label.includes('Momo') ? 2962.51 : 3859.11;
            await prisma.monthlyItem.update({
                where: { id: item.id },
                data: { checked: true, amount: realAmount }
            });
            console.log(`[OK] ${item.label} validé avec le montant réel de ${realAmount}€.`);
        }
    }

    // 2. Revenus exceptionnels
    const others = [
        { label: 'Helium/Sidecare (total)', amount: 245.69 }, // 128 + 44.65 + 61.03 + 12.01
        { label: 'Aide/Transferts (total)', amount: 2500.00 }, // 500 + 1000 + 1000
        { label: 'Rbt HelloFresh (total)', amount: 187.94 }, // 87.99 + 87.99 + 7.96 + 4.00
        { label: 'Rbt Betterway Ponant', amount: 36.00 },
        { label: 'VIR Thomas', amount: 1300.00 }
    ];

    for (const other of others) {
        await prisma.monthlyItem.upsert({
            where: {
                label_month_year_type: {
                    label: other.label,
                    month: 3,
                    year: 2026,
                    type: 'INCOME'
                }
            },
            update: { checked: true, amount: other.amount },
            create: {
                label: other.label,
                amount: other.amount,
                type: 'INCOME',
                month: 3,
                year: 2026,
                checked: true
            }
        });
        console.log(`[OK] Revenu exceptionnel ajouté/validé : ${other.label} (${other.amount}€)`);
    }

    console.log('--- Fin de la validation ---');
}

validateMarchIncomes()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
