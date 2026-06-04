import { prisma } from "../src/infrastructure/prisma-client";

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.recurringTransaction.deleteMany();
  await prisma.expenseGroup.deleteMany();
  await prisma.envelope.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();

  console.log("Création des catégories...");
  const catIncome = await prisma.category.create({ data: { name: "Revenus", type: "INCOME" } });
  const catHousing = await prisma.category.create({ data: { name: "Logement", type: "EXPENSE" } });
  const catTransport = await prisma.category.create({ data: { name: "Transport", type: "EXPENSE" } });
  const catFood = await prisma.category.create({ data: { name: "Alimentation", type: "EXPENSE" } });
  const catHealth = await prisma.category.create({ data: { name: "Santé", type: "EXPENSE" } });
  const catLeisure = await prisma.category.create({ data: { name: "Loisirs", type: "EXPENSE" } });
  const catMisc = await prisma.category.create({ data: { name: "Divers", type: "EXPENSE" } });

  console.log("Création des groupes de charges...");
  const groupHousing = await prisma.expenseGroup.create({ data: { name: "Logement & Crédits", order: 1 } });
  const groupHome = await prisma.expenseGroup.create({ data: { name: "Maison & Énergie", order: 2 } });
  const groupTransport = await prisma.expenseGroup.create({ data: { name: "Transports", order: 3 } });
  const groupHealth = await prisma.expenseGroup.create({ data: { name: "Abonnements & Santé", order: 4 } });
  const groupTaxes = await prisma.expenseGroup.create({ data: { name: "Impôts & Épargne", order: 5 } });

  console.log("Création des comptes...");
  await prisma.account.create({ data: { name: "Boursorama Joint", type: "CHECKING", balance: 4520.50 } });
  await prisma.account.create({ data: { name: "Livret A Joint", type: "SAVINGS", balance: 12000 } });

  console.log("Création des revenus récurrents...");
  const incomes = [
    { label: 'Salaire Miguel', amount: 3883.31, type: 'INCOME', categoryId: catIncome.id },
    { label: 'Salaire Morgane', amount: 2335.08, type: 'INCOME', categoryId: catIncome.id },
  ];

  for (const inc of incomes) {
    await prisma.recurringTransaction.create({ data: inc });
  }

  console.log("Création des charges récurrentes...");
  const charges = [
    { label: 'Crédit immobilier', amount: 1207.80, type: 'EXPENSE', groupId: groupHousing.id, categoryId: catHousing.id },
    { label: 'EDF', amount: 82.73, type: 'EXPENSE', groupId: groupHome.id, categoryId: catHousing.id },
    { label: 'Tesla', amount: 492.12, type: 'EXPENSE', groupId: groupTransport.id, categoryId: catTransport.id },
    { label: 'Mutuelle compl.', amount: 18.84, type: 'EXPENSE', groupId: groupHealth.id, categoryId: catHealth.id },
    { label: 'Impôts revenus', amount: 272.00, type: 'EXPENSE', groupId: groupTaxes.id, categoryId: catMisc.id },
  ];

  for (const chg of charges) {
    await prisma.recurringTransaction.create({ data: chg });
  }

  console.log("Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
