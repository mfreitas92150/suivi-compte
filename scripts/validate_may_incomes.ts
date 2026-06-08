import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMayIncomes() {
    console.log('--- Validation des revenus de Mai 2026 ---');

    // 1. Salaires
    const items = await prisma.monthlyItem.findMany({
        where: { month: 5, year: 2026, type: 'INCOME' }
    });

    for (const item of items) {
        if (item.label.includes('Mig') || item.label.includes('Momo')) {
            await prisma.monthlyItem.update({
                where: { id: item.id },
                data: { checked: true }
            });
            console.log(`[OK] ${item.label} validé.`);
        }
    }

    // 2. Ajouter les remboursements/aides trouvés comme revenus exceptionnels s'ils n'existent pas
    const others = [
        { label: 'Rbt CAF', amount: 173.66 },
        { label: 'Rbt CPAM (total)', amount: 84.03 }, // 24.03 + 60.00
        { label: 'Rbt Baloo (total)', amount: 497.35 }, // 17.35 + 80.00 + 400.00
        { label: 'VIR Aide', amount: 500.00 },
        { label: 'Helium/Sidecare', amount: 128.00 }
    ];

    for (const other of others) {
        await prisma.monthlyItem.upsert({
            where: {
                label_month_year_type: {
                    label: other.label,
                    month: 5,
                    year: 2026,
                    type: 'INCOME'
                }
            },
            update: { checked: true },
            create: {
                label: other.label,
                amount: other.amount,
                type: 'INCOME',
                month: 5,
                year: 2026,
                checked: true
            }
        });
        console.log(`[OK] Revenu exceptionnel ajouté/validé : ${other.label} (${other.amount}€)`);
    }

    console.log('--- Fin de la validation ---');
}

validateMayIncomes()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
