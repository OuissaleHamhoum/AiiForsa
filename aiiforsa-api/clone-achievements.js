const { PrismaClient } = require('@prisma/client');

async function clone(sourceEmail, targetEmail) {
  const prisma = new PrismaClient();
  try {
    const source = await prisma.user.findUnique({ where: { email: sourceEmail } });
    const target = await prisma.user.findUnique({ where: { email: targetEmail } });

    if (!source) throw new Error('Source user not found: ' + sourceEmail);
    if (!target) throw new Error('Target user not found: ' + targetEmail);

    const sourceAchievements = await prisma.userAchievement.findMany({
      where: { userId: source.id },
      select: {
        achievementDefId: true,
        earnCount: true,
        awardedAt: true,
        claimed: true,
        claimedAt: true,
        meta: true,
      },
    });

    let created = 0;
    let skipped = 0;

    for (const a of sourceAchievements) {
      const exists = await prisma.userAchievement.findUnique({
        where: { userId_achievementDefId: { userId: target.id, achievementDefId: a.achievementDefId } },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await prisma.userAchievement.create({
        data: {
          userId: target.id,
          achievementDefId: a.achievementDefId,
          earnCount: a.earnCount || 1,
          awardedAt: a.awardedAt || new Date(),
          claimed: a.claimed || false,
          claimedAt: a.claimedAt || null,
          meta: a.meta || null,
        },
      });

      created++;
    }

    console.log(`Done. Created ${created} rows, skipped ${skipped} existing rows.`);
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await (new PrismaClient()).$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  const [,, src, tgt] = process.argv;
  if (!src || !tgt) {
    console.error('Usage: node clone-achievements.js <sourceEmail> <targetEmail>');
    process.exit(1);
  }
  clone(src, tgt).then(() => process.exit(0));
}
