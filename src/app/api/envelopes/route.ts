import { NextResponse } from 'next/server';
import { GetEnvelopesUseCase, UpsertEnvelopeUseCase } from '@/core/application/EnvelopeUseCases';
import { PrismaEnvelopeRepository } from '@/infrastructure/PrismaRepositories';

const repo = new PrismaEnvelopeRepository();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  try {
    const useCase = new GetEnvelopesUseCase(repo);
    const envelopes = await useCase.execute(month, year);
    return NextResponse.json(envelopes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch envelopes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/envelopes", body);
    const useCase = new UpsertEnvelopeUseCase(repo);
    const envelope = await useCase.execute(body);
    return NextResponse.json(envelope, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/envelopes failed", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
