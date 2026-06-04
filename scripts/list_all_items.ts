import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.monthlyItem.findMany();
  console.log("All MonthlyItems:", all);
}

main();
