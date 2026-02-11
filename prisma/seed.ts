import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAnswer = await bcrypt.hash('tokyo', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@animonotes.app' },
    update: {},
    create: {
      email: 'test@animonotes.app',
      name: 'Test User',
      password: hashedPassword,
      securityQuestion: 'What is your favorite city?',
      securityAnswer: hashedAnswer,
      role: 'user',
    },
  });
  console.log(`✅ Created/verified test user: ${testUser.email}`);

  // Seed categories
  const categories = [
    {
      name: 'Math',
      slug: 'math',
      description: 'Mathematical concepts, problems, and discussions',
    },
    {
      name: 'Science',
      slug: 'science',
      description: 'Physics, chemistry, biology, and scientific discoveries',
    },
    {
      name: 'History',
      slug: 'history',
      description: 'Historical events, figures, and analysis',
    },
    {
      name: 'Literature',
      slug: 'literature',
      description: 'Books, poetry, writing, and literary analysis',
    },
    {
      name: 'Languages',
      slug: 'languages',
      description: 'Language learning, linguistics, and translation',
    },
    {
      name: 'General',
      slug: 'general',
      description: 'General discussion and off-topic conversations',
    },
  ];

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`✅ Created/verified category: ${created.name}`);
  }

  // Seed sample posts
  const mathCategory = await prisma.category.findUnique({ where: { slug: 'math' } });
  const scienceCategory = await prisma.category.findUnique({ where: { slug: 'science' } });
  const generalCategory = await prisma.category.findUnique({ where: { slug: 'general' } });

  if (mathCategory && scienceCategory && generalCategory) {
    const existingPosts = await prisma.post.count();
    if (existingPosts === 0) {
      const posts = [
        {
          title: 'What makes the Fibonacci sequence so fascinating?',
          content:
            "<p>I've been diving into the Fibonacci sequence lately and I'm amazed at how it appears everywhere — from sunflower spirals to galaxy formations. What are your favorite examples of Fibonacci in nature?</p>",
          authorId: testUser.id,
          categoryId: mathCategory.id,
        },
        {
          title: 'The James Webb Space Telescope — latest discoveries',
          content:
            "<p>JWST has been delivering incredible images and data since its launch. What discovery has surprised you the most so far? I'm personally blown away by the early galaxy formations it has captured.</p>",
          authorId: testUser.id,
          categoryId: scienceCategory.id,
        },
        {
          title: 'Welcome to Animo Notes!',
          content:
            "<p>Welcome everyone! This is a space for thoughtful discussion across all topics. Feel free to introduce yourself and share what you're interested in. Looking forward to great conversations!</p>",
          authorId: testUser.id,
          categoryId: generalCategory.id,
        },
      ];

      for (const post of posts) {
        const created = await prisma.post.create({ data: post });
        console.log(`✅ Created post: ${created.title}`);
      }
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
