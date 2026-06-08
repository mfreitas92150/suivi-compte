import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateAprilExpensesFinal() {
    console.log('--- Validation des charges fixes d\'Avril 2026 ---');

    // On suppose que l'utilisateur a vérifié les montants dans les CSV
    // Pour ce test, on valide toutes les charges fixes créées lors de l'initialisation.

    const itemsToUpdate = await prisma.monthlyItem.updateMany({
        where: { month: 4, year: 2026, type: 'EXPENSE' },
        data: { checked: true }
    });

    console.log(`[OK] ${itemsToUpdate.count} charges fixes ont été marquées comme validées (cochées) pour Avril 2026.`);
    console.log('--- Fin de la validation ---');
}

validateAprilExpensesFinal()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
