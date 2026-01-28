const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, xp: true, level: true },
    });
    console.log('Users:');
    users.forEach(u => console.log(JSON.stringify(u, null, 2)));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();