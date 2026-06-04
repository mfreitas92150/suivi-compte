import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log("--- Testing Category Creation ---");
  try {
    const newCat = await prisma.category.create({
      data: {
        name: "Test Cat " + Date.now(),
        type: "EXPENSE",
        defaultAmount: 100
      }
    });
    console.log("Category created successfully:", newCat);

    console.log("--- Testing Category Update ---");
    const updatedCat = await prisma.category.update({
      where: { id: newCat.id },
      data: { defaultAmount: 200 }
    });
    console.log("Category updated successfully:", updatedCat);

    console.log("--- Testing Envelope Upsert ---");
    const month = 6;
    const year = 2026;
    
    // First upsert (create)
    const env1 = await prisma.envelope.upsert({
      where: {
        categoryId_month_year: {
          categoryId: newCat.id,
          month,
          year
        }
      },
      update: { amount: 150 },
      create: {
        categoryId: newCat.id,
        month,
        year,
        amount: 150
      }
    });
    console.log("Envelope created via upsert:", env1);

    // Second upsert (update)
    const env2 = await prisma.envelope.upsert({
      where: {
        categoryId_month_year: {
          categoryId: newCat.id,
          month,
          year
        }
      },
      update: { amount: 300 },
      create: {
        categoryId: newCat.id,
        month,
        year,
        amount: 300
      }
    });
    console.log("Envelope updated via upsert:", env2);

    // Cleanup
    await prisma.envelope.delete({ where: { id: env1.id } });
    await prisma.category.delete({ where: { id: newCat.id } });
    console.log("Cleanup successful.");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
