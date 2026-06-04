
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const startDate = new Date('2026-06-01T00:00:00.000Z')
  const endDate = new Date('2026-07-01T00:00:00.000Z')

  const tx = await prisma.transaction.deleteMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  })

  const env = await prisma.envelope.deleteMany({
    where: {
      month: 6,
      year: 2026
    }
  })

  const med = await prisma.medicalTracking.deleteMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  })

  const sav = await prisma.savings.deleteMany({
    where: {
      month: 6,
      year: 2026
    }
  })

  console.log(`Deleted ${tx.count} transactions for June 2026`)
  console.log(`Deleted ${env.count} envelopes for June 2026`)
  console.log(`Deleted ${med.count} medical records for June 2026`)
  console.log(`Deleted ${sav.count} savings for June 2026`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
