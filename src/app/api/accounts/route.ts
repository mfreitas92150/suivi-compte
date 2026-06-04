import { NextResponse } from 'next/server';
import { GetAccountsUseCase } from '@/core/application/GetAccountsUseCase';
import { UpdateAccountUseCase } from '@/core/application/UpdateAccountUseCase';
import { CreateAccountUseCase } from '@/core/application/CreateAccountUseCase';
import { DeleteAccountUseCase } from '@/core/application/DeleteAccountUseCase';
import { PrismaAccountRepository } from '@/infrastructure/PrismaAccountRepository';

const accountRepository = new PrismaAccountRepository();

export async function GET() {
  try {
    const getAccountsUseCase = new GetAccountsUseCase(accountRepository);
    const accounts = await getAccountsUseCase.execute();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
    }

    const updateAccountUseCase = new UpdateAccountUseCase(accountRepository);
    const updatedAccount = await updateAccountUseCase.execute(id, data);
    
    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const createAccountUseCase = new CreateAccountUseCase(accountRepository);
    const createdAccount = await createAccountUseCase.execute(body);
    return NextResponse.json(createdAccount);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
    }

    const deleteAccountUseCase = new DeleteAccountUseCase(accountRepository);
    await deleteAccountUseCase.execute(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
