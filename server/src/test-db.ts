import { prisma } from './utils/prisma';

async function main() {
  console.log('--- DB INSPECTION START ---');
  const movies = await prisma.movie.findMany({
    take: 5,
    select: { title: true, genres: true, status: true }
  });
  
  if (movies.length === 0) {
    console.log('NO MOVIES FOUND IN DATABASE!');
  } else {
    movies.forEach((m, i) => {
      console.log(`\nMovie ${i+1}: ${m.title}`);
      console.log(`Genres:`, m.genres);
      console.log(`Status:`, m.status);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
