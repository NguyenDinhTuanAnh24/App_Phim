const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.movie.findMany({
    take: 10,
    select: { genres: true }
  });
  console.log('--- GENRES IN DB ---');
  movies.forEach((m, i) => {
    console.log(`Movie ${i+1}:`, m.genres);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
