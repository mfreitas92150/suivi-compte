import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purgeMonth(month: number, year: number) {
    console.log(`--- Purge complète de ${month}/${year} ---`);

    // 1. Transactions
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const trans = await prisma.transaction.deleteMany({
        where: { date: { gte: startDate, lte: endDate } }
    });
    console.log(`- Transactions supprimées : ${trans.count}`);

    // 2. Envelopes
    const envs = await prisma.envelope.deleteMany({
        where: { month, year }
    });
    console.log(`- Enveloppes supprimées : ${envs.count}`);

    // 3. MonthlyItems
    const items = await prisma.monthlyItem.deleteMany({
        where: { month, year }
    });
    console.log(`- Éléments mensuels supprimés : ${items.count}`);

    // 4. Savings
    const savings = await prisma.savings.deleteMany({
        where: { month, year }
    });
    console.log(`- Épargnes supprimées : ${savings.count}`);

    console.log(`--- Fin de la purge ---`);
}

const m = parseInt(process.argv[2]) || 5;
const y = parseInt(process.argv[3]) || 2026;

purgeMonth(m, y)
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
