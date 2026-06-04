import { NextResponse } from 'next/server';
import { InitializeMonthUseCase } from '@/core/application/MonthlyItemUseCases';
import { PrismaCategoryRepository, PrismaRecurringTransactionRepository, PrismaEnvelopeRepository, PrismaMonthlyItemRepository } from '@/infrastructure/PrismaRepositories';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and Year are required' }, { status: 400 });
    }

    const categoryRepo = new PrismaCategoryRepository();
    const recurringRepo = new PrismaRecurringTransactionRepository();
    const envelopeRepo = new PrismaEnvelopeRepository();
    const monthlyItemRepo = new PrismaMonthlyItemRepository();

    const useCase = new InitializeMonthUseCase(
      categoryRepo,
      recurringRepo,
      envelopeRepo,
      monthlyItemRepo
    );

    await useCase.execute(month, year);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Initialization failed:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
