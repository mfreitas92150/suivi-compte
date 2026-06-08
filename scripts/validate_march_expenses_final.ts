import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMarchExpensesFinal() {
    console.log('--- Validation des charges fixes de Mars 2026 ---');

    const itemsToUpdate = await prisma.monthlyItem.updateMany({
        where: { month: 3, year: 2026, type: 'EXPENSE' },
        data: { checked: true }
    });

    console.log(`[OK] ${itemsToUpdate.count} charges fixes ont été marquées comme validées (cochées) pour Mars 2026.`);
    console.log('--- Fin de la validation ---');
}

validateMarchExpensesFinal()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
