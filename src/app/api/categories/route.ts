import { NextResponse } from 'next/server';
import { GetCategoriesUseCase, CreateCategoryUseCase, UpdateCategoryUseCase, DeleteCategoryUseCase } from '@/core/application/CategoryUseCases';
import { PrismaCategoryRepository } from '@/infrastructure/PrismaRepositories';

const repo = new PrismaCategoryRepository();

export async function GET() {
  try {
    const useCase = new GetCategoriesUseCase(repo);
    const categories = await useCase.execute();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/categories", body);
    const useCase = new CreateCategoryUseCase(repo);
    const category = await useCase.execute(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories failed", error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    console.log("PATCH /api/categories", body);
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });

    const useCase = new UpdateCategoryUseCase(repo);
    const category = await useCase.execute(id, data);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error("PATCH /api/categories failed", error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });

    const useCase = new DeleteCategoryUseCase(repo);
    await useCase.execute(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 });
  }
}
