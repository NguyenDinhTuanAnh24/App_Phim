import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.seat.count({ where: { row: 'K' } });
  console.log('Total seats in Row K:', count);
  process.exit(0);
}
main();
