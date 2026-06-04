
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const startDate = new Date('2026-06-01T00:00:00.000Z')
  const endDate = new Date('2026-07-01T00:00:00.000Z')

  const transactionsCount = await prisma.transaction.count({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  })

  const envelopesCount = await prisma.envelope.count({
    where: {
      month: 6,
      year: 2026
    }
  })

  const mayStart = new Date('2026-05-01T00:00:00.000Z')
  const mayEnd = new Date('2026-06-01T00:00:00.000Z')

  const mayTransactionsCount = await prisma.transaction.count({
    where: {
      date: {
        gte: mayStart,
        lt: mayEnd
      }
    }
  })

  const mayEnvelopesCount = await prisma.envelope.count({
    where: {
      month: 5,
      year: 2026
    }
  })

  const allTransactionsCount = await prisma.transaction.count()
  const allEnvelopesCount = await prisma.envelope.count()

  console.log(`Total Transactions: ${allTransactionsCount}`)
  console.log(`Total Envelopes: ${allEnvelopesCount}`)
  console.log(`Transactions in May 2026: ${mayTransactionsCount}`)
  console.log(`Envelopes in May 2026: ${mayEnvelopesCount}`)
  const medicalCount = await prisma.medicalTracking.count({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  })

  const savingsCount = await prisma.savings.count({
    where: {
      month: 6,
      year: 2026
    }
  })

  console.log(`Medical Tracking in June 2026: ${medicalCount}`)
  console.log(`Savings in June 2026: ${savingsCount}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
