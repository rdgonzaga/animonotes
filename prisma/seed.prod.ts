import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_DATA = [
  {
    name: 'BAGCED',
    slug: 'bagced',
    description: 'Brother Andrew Gonzalez FSC College of Education',
  },
  {
    name: 'CCS',
    slug: 'ccs',
    description: 'College of Computer Studies',
  },
  {
    name: 'TDSOL',
    slug: 'tdsol',
    description: 'Tanada-Diokno School of Law',
  },
  {
    name: 'CLA',
    slug: 'cla',
    description: 'College of Liberal Arts',
  },
  {
    name: 'COS',
    slug: 'cos',
    description: 'College of Science',
  },
  {
    name: 'GCOE',
    slug: 'gcoe',
    description: 'Gokongwei College of Engineering',
  },
  {
    name: 'RVRCOB',
    slug: 'rvrcob',
    description: 'Ramon V. del Rosario College of Business',
  },
  {
    name: 'SOE',
    slug: 'soe',
    description: 'School of Economics',
  },
] as const;

async function seedCategories() {
  for (const category of CATEGORY_DATA) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
      },
    });
  }
}

async function ensurePrivilegedUsers() {
  const adminEmail = 'rainer_gonzaga@dlsu.edu.ph';
  const moderatorEmail = 'duncan_marcaida@dlsu.edu.ph';

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        role: 'admin',
        emailVerified: true,
      },
    });
  }

  const moderator = await prisma.user.findUnique({ where: { email: moderatorEmail } });
  if (moderator) {
    await prisma.user.update({
      where: { id: moderator.id },
      data: {
        role: 'moderator',
        emailVerified: true,
      },
    });
  }
}

async function main() {
  console.log('Starting production-safe seed...');
  console.log('No destructive operations will be executed.');

  await seedCategories();
  await ensurePrivilegedUsers();

  console.log('Production-safe seed completed.');
}

main()
  .catch((error) => {
    console.error('Production-safe seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
