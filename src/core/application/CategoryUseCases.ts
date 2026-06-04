import { Category } from '../domain/entities';
import { ICategoryRepository } from '../ports/repositories';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  async execute(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return this.categoryRepository.create(data);
  }
}

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  async execute(id: string, data: Partial<Category>): Promise<Category> {
    return this.categoryRepository.update(id, data);
  }
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  async execute(id: string): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}
