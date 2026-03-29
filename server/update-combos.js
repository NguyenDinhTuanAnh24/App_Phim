const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateComboImages() {
  const combos = [
    {
      name: 'Bắp rang bơ lớn',
      image_url: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400',
    },
    {
      name: 'Combo 1 người',
      image_url: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400',
    },
    {
      name: 'Combo đôi',
      image_url: 'https://images.unsplash.com/photo-1567608285969-48e4bbe0d399?w=400',
    },
    {
      name: 'Combo gia đình',
      image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
    },
    {
      name: 'Nước ngọt lớn',
      image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    },
  ];

  for (const combo of combos) {
    await prisma.foodCombo.updateMany({
      where: { name: combo.name },
      data: { image_url: combo.image_url },
    });
    console.log('Updated:', combo.name);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

updateComboImages().catch(console.error);
