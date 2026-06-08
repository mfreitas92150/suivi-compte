import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up budget configuration...");

  try {
    // 1. Create Expense Groups (for Fixed Charges)
    const groups = [
      "Logement",
      "Crédits",
      "Impôts",
      "Énergie, Eau & Télécoms",
      "Assurances",
      "Services",
      "Transport"
    ];

    console.log("Creating expense groups...");
    for (const name of groups) {
      await prisma.expenseGroup.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      console.log(`- Group: ${name}`);
    }

    // 2. Create Envelope Templates (Categories with default amounts)
    const envelopes = [
      { name: "Courses / Alimentation", amount: 900 },
      { name: "Loisirs & Sorties", amount: 200 },
      { name: "Maison & Déco", amount: 150 },
      { name: "Shopping / Sport", amount: 150 },
      { name: "Transport / Auto", amount: 150 },
      { name: "Divers / Imprévus", amount: 300 }
    ];

    console.log("Creating envelope templates (categories)...");
    for (const env of envelopes) {
      // Check if already exists to avoid duplicates
      const existing = await prisma.category.findFirst({ where: { name: env.name } });
      if (!existing) {
        await prisma.category.create({
          data: {
            name: env.name,
            type: "EXPENSE",
            defaultAmount: env.amount
          }
        });
        console.log(`- Envelope: ${env.name} (${env.amount}€)`);
      } else {
        await prisma.category.update({
          where: { id: existing.id },
          data: { defaultAmount: env.amount }
        });
        console.log(`- Updated Envelope: ${env.name} (${env.amount}€)`);
      }
    }

    // 3. Create basic categories for income
    const incomeCategories = ["Salaire 1", "Salaire 2", "Remboursements"];
    for (const name of incomeCategories) {
      const existing = await prisma.category.findFirst({ where: { name } });
      if (!existing) {
        await prisma.category.create({
          data: { name, type: "INCOME" }
        });
        console.log(`- Income Category: ${name}`);
      }
    }

    // 4. Create Recurring Income Templates (Fixed Income)
    const fixedIncomes = [
      { label: "Salaire Mig (SWM)", amount: 3893.03, categoryName: "Salaire 1" },
      { label: "Salaire Momo (Ponant)", amount: 2335.08, categoryName: "Salaire 2" }
    ];

    console.log("Creating recurring income templates...");
    for (const income of fixedIncomes) {
      const category = await prisma.category.findFirst({ where: { name: income.categoryName } });
      
      const existing = await prisma.recurringTransaction.findFirst({ 
        where: { label: income.label, type: "INCOME" } 
      });

      if (!existing) {
        await prisma.recurringTransaction.create({
          data: {
            label: income.label,
            amount: income.amount,
            type: "INCOME",
            categoryId: category?.id,
            active: true
          }
        });
        console.log(`- Income Template: ${income.label} (${income.amount}€)`);
      } else {
        await prisma.recurringTransaction.update({
          where: { id: existing.id },
          data: { amount: income.amount, categoryId: category?.id }
        });
        console.log(`- Updated Income Template: ${income.label} (${income.amount}€)`);
      }
    }

    // 5. Create Recurring Expense Templates (Fixed Charges)
    const fixedExpenses = [
      { label: "Prêt Immobilier", amount: 1207.80, groupName: "Logement" },
      { label: "LOA Tesla", amount: 494.12, groupName: "Crédits" },
      { label: "Crédit travaux", amount: 319.83, groupName: "Crédits" },
      { label: "Impôts revenus", amount: 272.00, groupName: "Impôts" },
      { label: "TF BBA", amount: 132.00, groupName: "Impôts" },
      { label: "TF Courbevoie", amount: 70.00, groupName: "Impôts" },
      { label: "TF Duranne", amount: 54.00, groupName: "Impôts" },
      { label: "GDF", amount: 98.35, groupName: "Énergie, Eau & Télécoms" },
      { label: "EDF", amount: 82.73, groupName: "Énergie, Eau & Télécoms" },
      { label: "EDF Courbevoie", amount: 26.00, groupName: "Énergie, Eau & Télécoms" },
      { label: "Eaux de Marseille", amount: 50.55, groupName: "Énergie, Eau & Télécoms" },
      { label: "Orange Fibre", amount: 24.99, groupName: "Énergie, Eau & Télécoms" },
      { label: "SFR (Momo)", amount: 7.99, groupName: "Énergie, Eau & Télécoms" },
      { label: "Free (Mig)", amount: 2.00, groupName: "Énergie, Eau & Télécoms" },
      { label: "Axa Tesla", amount: 66.16, groupName: "Assurances" },
      { label: "Axa Picasso", amount: 48.92, groupName: "Assurances" },
      { label: "Axa Habitation", amount: 41.85, groupName: "Assurances" },
      { label: "Assurance crédit Mig", amount: 44.29, groupName: "Assurances" },
      { label: "Assurance crédit Momo", amount: 27.28, groupName: "Assurances" },
      { label: "Ménage O2", amount: 222.80, groupName: "Services" },
      { label: "Mutuelle complémentaire", amount: 19.22, groupName: "Services" },
      { label: "Proxiserve", amount: 13.80, groupName: "Services" },
      { label: "Abonnement RTM", amount: 60.00, groupName: "Transport" }
    ];

    console.log("Creating recurring expense templates...");
    for (const exp of fixedExpenses) {
      const group = await prisma.expenseGroup.findUnique({ where: { name: exp.groupName } });
      
      const existing = await prisma.recurringTransaction.findFirst({ 
        where: { label: exp.label, type: "EXPENSE" } 
      });

      if (!existing) {
        await prisma.recurringTransaction.create({
          data: {
            label: exp.label,
            amount: exp.amount,
            type: "EXPENSE",
            groupId: group?.id,
            active: true
          }
        });
        console.log(`- Expense Template: ${exp.label} (${exp.amount}€)`);
      } else {
        await prisma.recurringTransaction.update({
          where: { id: existing.id },
          data: { amount: exp.amount, groupId: group?.id }
        });
        console.log(`- Updated Expense Template: ${exp.label} (${exp.amount}€)`);
      }
    }

    console.log("Configuration setup complete!");
  } catch (error) {
    console.error("Error during setup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
