import { NextResponse } from 'next/server';
import { GetMonthlyItemsUseCase, CreateMonthlyItemUseCase, UpdateMonthlyItemUseCase, DeleteMonthlyItemUseCase } from '@/core/application/MonthlyItemUseCases';
import { PrismaMonthlyItemRepository } from '@/infrastructure/PrismaRepositories';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mParam = searchParams.get('month');
  const yParam = searchParams.get('year');
  
  const now = new Date();
  const month = mParam ? parseInt(mParam) : now.getMonth() + 1;
  const year = yParam ? parseInt(yParam) : now.getFullYear();

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 });
  }

  try {
    const repo = new PrismaMonthlyItemRepository();
    const useCase = new GetMonthlyItemsUseCase(repo);
    const items = await useCase.execute(month, year);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET /api/pilotage/items failed:", error);
    return NextResponse.json({ error: 'Failed to fetch monthly items', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const repo = new PrismaMonthlyItemRepository();
    const useCase = new CreateMonthlyItemUseCase(repo);
    const item = await useCase.execute(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const repo = new PrismaMonthlyItemRepository();
    const useCase = new UpdateMonthlyItemUseCase(repo);
    const item = await useCase.execute(id, data);
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const repo = new PrismaMonthlyItemRepository();
    const useCase = new DeleteMonthlyItemUseCase(repo);
    await useCase.execute(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete monthly item' }, { status: 400 });
  }
}
