import { prisma } from '../src/infrastructure/prisma-client';

async function main() {
  console.log("Prisma keys:", Object.keys(prisma).filter(k => !k.startsWith('_')));
  if ((prisma as any).monthlyItem) {
    console.log("monthlyItem IS defined on prisma");
  } else {
    console.log("monthlyItem IS NOT defined on prisma");
  }
}

main();
