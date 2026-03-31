import { prisma } from './utils/prisma';

async function main() {
  console.log('--- SEEDING TEST MOVIES ---');
  
  const testMovies = [
    {
      tmdb_id: 10001,
      title: 'Spider-Man: Across the Spider-Verse',
      original_title: 'Spider-Man: Across the Spider-Verse',
      overview: 'Miles Morales returns for the next chapter of the Oscar-winning Spider-Verse saga...',
      poster_url: '/8Gxv8UbgkM1sLsbMTfsyO1jrS2l.jpg',
      backdrop_url: '/4HodYYKE6sU9ujuS3M9v93fsG1R.jpg',
      genres: JSON.stringify(['Hành động', 'Marvel', 'Hoạt hình']),
      director: 'Joaquim Dos Santos',
      duration: 140,
      rating: 8.9,
      language: 'Tiếng Anh',
      status: 'NOW_SHOWING' as any,
      release_date: new Date('2023-06-02'),
    },
    {
      tmdb_id: 10002,
      title: 'The Super Mario Bros. Movie',
      original_title: 'The Super Mario Bros. Movie',
      overview: 'A plumber named Mario travels through an underground labyrinth with his brother, Luigi...',
      poster_url: '/qNBAvMVv95H67vBqicqUNpHLp6S.jpg',
      backdrop_url: '/9n2tI3uLI1T0O9SZMSw9OR3aXvw.jpg',
      genres: JSON.stringify(['Hài hước', 'Hoạt hình', 'Phiêu lưu']),
      director: 'Aaron Horvath',
      duration: 92,
      rating: 7.8,
      language: 'Tiếng Anh',
      status: 'NOW_SHOWING' as any,
      release_date: new Date('2023-04-05'),
    },
    {
      tmdb_id: 10003,
      title: 'Evil Dead Rise',
      original_title: 'Evil Dead Rise',
      overview: 'A twisted tale of two estranged sisters whose reunion is cut short by the rise of flesh-possessing demons...',
      poster_url: '/mIBCiBEMB1onWURC9kapmUqCDdz.jpg',
      backdrop_url: '/h8uBv0M0ar6H9UIEXurS6p6SST5.jpg',
      genres: JSON.stringify(['Kinh dị', 'Gây cấn']),
      director: 'Lee Cronin',
      duration: 96,
      rating: 7.1,
      language: 'Tiếng Anh',
      status: 'NOW_SHOWING' as any,
      release_date: new Date('2023-04-21'),
    }
  ];

  for (const m of testMovies) {
    await prisma.movie.upsert({
      where: { tmdb_id: m.tmdb_id },
      update: m,
      create: m
    });
  }
  
  console.log('DONE! 3 Movies seeded for testing.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
