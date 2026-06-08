import { prisma } from '../src/infrastructure/prisma-client';

async function main() {
  console.log("Cleaning up all data using DROP TABLE for total reset...");

  try {
    const tables = [
      'Transaction', 'MonthlyItem', 'Envelope', 'Savings', 'MedicalTracking', 
      'RecurringTransaction', 'ExpenseGroup', 'Category', 'Account', '_prisma_migrations'
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);
        console.log(`- Dropped table ${table}`);
      } catch (e) {
        console.warn(`- Could not drop ${table}:`, e.message);
      }
    }

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
