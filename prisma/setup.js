const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  console.log('Setting up database...');

  await prisma.$transaction(
    async (tx) => {
      const ownerRole = await tx.userRole.upsert({
        where: { slug: 'owner' },
        update: {},
        create: {
          slug: 'owner',
          name: 'Owner',
          description: 'The default system role with full access.',
          isProtected: true,
          isDefault: false,
        },
      });

      const initialPassword = await bcrypt.hash('0000', 10);

      await tx.user.upsert({
        where: { email: 'owner@example.com' },
        update: {},
        create: {
          email: 'owner@example.com',
          name: 'System Owner',
          password: initialPassword,
          roleId: ownerRole.id,
          avatar: null,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
        },
      });

      await tx.user.upsert({
        where: { email: 'demo@tripflex.com' },
        update: {},
        create: {
          isProtected: true,
          email: 'demo@tripflex.com',
          name: 'Demo',
          password: initialPassword,
          roleId: ownerRole.id,
          avatar: null,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
        },
      });

      await tx.userRole.create({
        data: {
          slug: 'member',
          name: 'Member',
          description: 'Default member role',
          isDefault: true,
          isProtected: true,
          createdAt: new Date(),
        },
      });

      await tx.systemSetting.create({
        data: {
          name: 'Tripflex',
        },
      });

      console.log('Database setup completed!');
    },
    {
      timeout: 120000,
      maxWait: 120000,
    },
  );
}

main()
  .catch((e) => {
    console.error('Error during setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
