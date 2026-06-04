import { NextResponse } from 'next/server';
import { GetRecurringTransactionsUseCase, CreateRecurringTransactionUseCase, UpdateRecurringTransactionUseCase, DeleteRecurringTransactionUseCase } from '@/core/application/RecurringTransactionUseCases';
import { PrismaRecurringTransactionRepository } from '@/infrastructure/PrismaRepositories';

const repo = new PrismaRecurringTransactionRepository();

export async function GET() {
  try {
    const useCase = new GetRecurringTransactionsUseCase(repo);
    const data = await useCase.execute();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new CreateRecurringTransactionUseCase(repo);
    const data = await useCase.execute(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const useCase = new UpdateRecurringTransactionUseCase(repo);
    const updated = await useCase.execute(id, data);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Pour DELETE, on pourrait avoir un paramètre d'URL ou utiliser un body
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('ID is required');
    const useCase = new DeleteRecurringTransactionUseCase(repo);
    await useCase.execute(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
