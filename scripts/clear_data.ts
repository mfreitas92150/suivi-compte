import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up all transaction and month-related data...");

  try {
    const transactions = await prisma.transaction.deleteMany({});
    console.log(`- Deleted ${transactions.count} transactions`);

    const monthlyItems = await prisma.monthlyItem.deleteMany({});
    console.log(`- Deleted ${monthlyItems.count} monthly items`);

    const envelopes = await prisma.envelope.deleteMany({});
    console.log(`- Deleted ${envelopes.count} envelopes`);

    const savings = await prisma.savings.deleteMany({});
    console.log(`- Deleted ${savings.count} savings records`);

    const medical = await prisma.medicalTracking.deleteMany({});
    console.log(`- Deleted ${medical.count} medical tracking records`);

    const recurring = await prisma.recurringTransaction.deleteMany({});
    console.log(`- Deleted ${recurring.count} recurring templates`);

    const groups = await prisma.expenseGroup.deleteMany({});
    console.log(`- Deleted ${groups.count} expense groups`);

    const categories = await prisma.category.deleteMany({});
    console.log(`- Deleted ${categories.count} categories (envelope templates)`);

    // Reset account balances to 0
    const accounts = await prisma.account.updateMany({
      data: { balance: 0 }
    });
    console.log(`- Reset balance for ${accounts.count} accounts`);

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
