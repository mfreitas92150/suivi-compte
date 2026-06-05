import { NextResponse } from 'next/server';
import { GetTransactionsUseCase, CreateTransactionUseCase, DeleteTransactionUseCase } from '@/core/application/TransactionUseCases';
import { PrismaTransactionRepository } from '@/infrastructure/PrismaRepositories';
import { auth } from '@clerk/nextjs/server';

const repo = new PrismaTransactionRepository();

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const accountId = searchParams.get('accountId') || undefined;

  try {
    const useCase = new GetTransactionsUseCase(repo);
    const transactions = await useCase.execute({ month, year, accountId });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const useCase = new CreateTransactionUseCase(repo);
    const transaction = await useCase.execute({
      ...body,
      date: new Date(body.date)
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const useCase = new DeleteTransactionUseCase(repo);
    await useCase.execute(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
