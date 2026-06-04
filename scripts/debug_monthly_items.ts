import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const items = await prisma.monthlyItem.findMany({
      where: { month: 2, year: 2026 }
    });
    console.log("Success:", items);
  } catch (error) {
    console.error("Error detected:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
