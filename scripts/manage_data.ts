import { PrismaCategoryRepository, PrismaTransactionRepository, PrismaMonthlyItemRepository } from '../src/infrastructure/PrismaRepositories';
import { PrismaAccountRepository } from '../src/infrastructure/PrismaAccountRepository';
import { Transaction, MonthlyItem } from '../src/core/domain/entities';

const accountRepo = new PrismaAccountRepository();
const categoryRepo = new PrismaCategoryRepository();
const transactionRepo = new PrismaTransactionRepository();
const itemRepo = new PrismaMonthlyItemRepository();

async function listAccounts() {
  const accounts = await accountRepo.findAll();
  console.table(accounts.map(a => ({ id: a.id, name: a.name, balance: a.balance })));
}

async function listCategories() {
  const categories = await categoryRepo.findAll();
  console.table(categories.map(c => ({ id: c.id, name: c.name, type: c.type })));
}

async function addTransaction(args: string[]) {
  const params: any = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--amount') params.amount = parseFloat(args[++i]);
    if (args[i] === '--desc') params.description = args[++i];
    if (args[i] === '--account') params.account = args[++i];
    if (args[i] === '--category') params.category = args[++i];
    if (args[i] === '--date') params.date = new Date(args[++i]);
    if (args[i] === '--fixed') params.isFixed = true;
  }

  if (!params.amount || !params.description || !params.account || !params.category) {
    console.error("Missing parameters: --amount, --desc, --account, --category are required");
    return;
  }

  // Resolve account
  const accounts = await accountRepo.findAll();
  const account = accounts.find(a => a.id === params.account || a.name.toLowerCase() === params.account.toLowerCase());
  if (!account) {
    console.error(`Account not found: ${params.account}`);
    return;
  }

  // Resolve category
  const categories = await categoryRepo.findAll();
  const category = categories.find(c => c.id === params.category || c.name.toLowerCase() === params.category.toLowerCase());
  if (!category) {
    console.error(`Category not found: ${params.category}`);
    return;
  }

  const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
    amount: params.amount,
    description: params.description,
    accountId: account.id,
    categoryId: category.id,
    date: params.date || new Date(),
    isFixed: !!params.isFixed,
    checked: false
  };

  const result = await transactionRepo.create(transaction);
  console.log("Transaction created:", result);
}

async function addMonthlyItem(args: string[]) {
  const params: any = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    checked: false
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--amount') params.amount = parseFloat(args[++i]);
    if (args[i] === '--label') params.label = args[++i];
    if (args[i] === '--type') params.type = args[++i].toUpperCase();
    if (args[i] === '--month') params.month = parseInt(args[++i]);
    if (args[i] === '--year') params.year = parseInt(args[++i]);
    if (args[i] === '--checked') params.checked = true;
  }

  if (!params.amount || !params.label || !params.type) {
    console.error("Missing parameters: --amount, --label, --type (INCOME/EXPENSE) are required");
    return;
  }

  const item: Omit<MonthlyItem, 'id' | 'createdAt' | 'updatedAt'> = {
    amount: params.amount,
    label: params.label,
    type: params.type as 'INCOME' | 'EXPENSE',
    month: params.month,
    year: params.year,
    checked: params.checked
  };

  const result = await itemRepo.create(item);
  console.log("Monthly item created:", result);
}

async function deleteMonth(args: string[]) {
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--month') month = parseInt(args[++i]);
    if (args[i] === '--year') year = parseInt(args[++i]);
  }

  console.log(`Searching for transactions in ${month}/${year}...`);
  const transactions = await transactionRepo.findAll({ month, year });

  if (transactions.length === 0) {
    console.log("No transactions found for this period.");
    return;
  }

  console.log(`Deleting ${transactions.length} transactions...`);
  for (const t of transactions) {
    await transactionRepo.delete(t.id);
  }
  console.log("Deletion complete.");
}

async function deleteItems(args: string[]) {
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--month') month = parseInt(args[++i]);
    if (args[i] === '--year') year = parseInt(args[++i]);
  }

  console.log(`Searching for monthly items in ${month}/${year}...`);
  const items = await itemRepo.findByPeriod(month, year);

  if (items.length === 0) {
    console.log("No monthly items found for this period.");
    return;
  }

  console.log(`Deleting ${items.length} items (fixed and exceptional)...`);
  for (const item of items) {
    await itemRepo.delete(item.id);
  }
  console.log("Deletion complete.");
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'list-accounts':
        await listAccounts();
        break;
      case 'list-categories':
        await listCategories();
        break;
      case 'add-transaction':
        await addTransaction(args);
        break;
      case 'add-item':
        await addMonthlyItem(args);
        break;
      case 'delete-month':
        await deleteMonth(args);
        break;
      case 'delete-items':
        await deleteItems(args);
        break;
      default:
        console.log("Usage: npx tsx scripts/manage_data.ts <command> [args]");
        console.log("Commands: list-accounts, list-categories, add-transaction, add-item, delete-month, delete-items");
        break;
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
