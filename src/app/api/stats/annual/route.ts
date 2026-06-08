import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/infrastructure/prisma-client';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  if (isNaN(year)) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
  }

  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get all transactions for the year
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Get all monthly items (fixed incomes and expenses) for the year
    const monthlyItems = await prisma.monthlyItem.findMany({
      where: {
        year: year,
      },
    });

    // Initialize array for 12 months
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    // Aggregate monthly items (salaries, fixed charges, etc.)
    monthlyItems.forEach((item) => {
      const monthIndex = item.month - 1; // month is 1-12
      
      if (item.type === 'INCOME') {
        monthlyStats[monthIndex].income += item.amount;
      } else if (item.type === 'EXPENSE') {
        monthlyStats[monthIndex].expense += item.amount;
      }
    });

    // Aggregate transactions by month
    transactions.forEach((t) => {
      // Filter out internal transfers
      if (t.category?.type === 'TRANSFER') return;

      const monthIndex = t.date.getMonth(); // 0 to 11
      
      if (t.amount < 0) {
        monthlyStats[monthIndex].expense += Math.abs(t.amount);
      } else if (t.amount > 0) {
        // Positive transaction in an expense category is usually a refund, 
        // so it reduces the total expenses.
        monthlyStats[monthIndex].expense -= t.amount;
      }
    });

    // Round to 2 decimal places to avoid floating point issues
    const formattedStats = monthlyStats.map(stat => ({
      month: stat.month,
      income: Math.round(stat.income * 100) / 100,
      expense: Math.round(stat.expense * 100) / 100,
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("Error fetching annual stats:", error);
    return NextResponse.json({ error: 'Failed to fetch annual stats' }, { status: 500 });
  }
}
