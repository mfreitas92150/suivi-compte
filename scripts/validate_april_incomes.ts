import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateAprilIncomes() {
    console.log('--- Validation des revenus d\'Avril 2026 ---');

    // 1. Salaires
    const items = await prisma.monthlyItem.findMany({
        where: { month: 4, year: 2026, type: 'INCOME' }
    });

    for (const item of items) {
        if (item.label.includes('Mig') || item.label.includes('Momo')) {
            // Note: The template amount for Momo might be 2335.08, but in April it was 2305.21.
            // We update the item with the real amount and validate it.
            const realAmount = item.label.includes('Momo') ? 2305.21 : 3893.03;
            await prisma.monthlyItem.update({
                where: { id: item.id },
                data: { checked: true, amount: realAmount }
            });
            console.log(`[OK] ${item.label} validé avec le montant réel de ${realAmount}€.`);
        }
    }

    // 2. Revenus exceptionnels
    const others = [
        { label: 'Rbt CAF', amount: 172.29 },
        { label: 'Rbt CPAM (total)', amount: 65.24 }, // 17.32 + 17.50 + 13.10 + 17.32
        { label: 'Rbt Baloo', amount: 13.90 },
        { label: 'Helium/Sidecare (total)', amount: 232.62 }, // 112.56 + 7.50 + 112.56
        { label: 'VIR Aide Avril', amount: 1000.00 },
        { label: 'Remboursement EDF', amount: 30.51 }
    ];

    for (const other of others) {
        await prisma.monthlyItem.upsert({
            where: {
                label_month_year_type: {
                    label: other.label,
                    month: 4,
                    year: 2026,
                    type: 'INCOME'
                }
            },
            update: { checked: true, amount: other.amount },
            create: {
                label: other.label,
                amount: other.amount,
                type: 'INCOME',
                month: 4,
                year: 2026,
                checked: true
            }
        });
        console.log(`[OK] Revenu exceptionnel ajouté/validé : ${other.label} (${other.amount}€)`);
    }

    console.log('--- Fin de la validation ---');
}

validateAprilIncomes()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
