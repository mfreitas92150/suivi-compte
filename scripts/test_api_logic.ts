import { GetMonthlyItemsUseCase } from '../src/core/application/MonthlyItemUseCases';
import { PrismaMonthlyItemRepository } from '../src/infrastructure/PrismaRepositories';

async function test() {
  const repo = new PrismaMonthlyItemRepository();
  const useCase = new GetMonthlyItemsUseCase(repo);
  try {
    const items = await useCase.execute(2, 2026);
    console.log("Items:", items);
  } catch (err) {
    console.error("UseCase Error:", err);
  }
}

test();
