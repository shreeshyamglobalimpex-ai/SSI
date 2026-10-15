import { db } from '../lib/db/prisma';
import { hashPassword } from '../lib/auth/admin';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@shreeshyamintimpex.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const passwordHash = await hashPassword(password);

  await db.admin.upsert({
    where: { email },
    update: { passwordHash, active: true },
    create: { email, passwordHash, name: 'Administrator' },
  });

  console.log(`Admin ready: ${email}`);

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD was not set — the default password is in use. Change it after first login.');
  }
}

main()
  .catch((error) => {
    console.error('Admin creation failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });