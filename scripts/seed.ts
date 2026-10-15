import { db } from '../lib/db/prisma';
import { slugify } from '../lib/utils/slug';

const categories = ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Other'];

const siteContentEntries: Array<[string, string]> = [
  ['about', 'Shree Shyam International is a pharmaceutical trading and export business focused on dependable sourcing and international supply.'],
];

async function main() {
  for (const name of categories) {
    await db.category.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
  }

  for (const [key, value] of siteContentEntries) {
    await db.siteContent.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
