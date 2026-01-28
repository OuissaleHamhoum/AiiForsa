const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.userAchievement.count();
    console.log('Total UserAchievement records:', total);

    const rows = await prisma.userAchievement.findMany({
      take: 20,
      select: {
        id: true,
        userId: true,
        achievementDefId: true,
        claimed: true,
        claimedAt: true,
        earnCount: true,
        awardedAt: true,
        createdAt: true,
        updatedAt: true,
        meta: true,
        achievementDef: {
          select: { id: true, key: true, title: true }
        }
      }
    });

    if (rows.length === 0) {
      console.log('No UserAchievement rows found.');
    } else {
      console.log('Sample UserAchievement rows (up to 20):');
      rows.forEach(r => {
        console.log(JSON.stringify(r, null, 2));
      });
    }
  } catch (err) {
    console.error('Error querying userAchievement:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();