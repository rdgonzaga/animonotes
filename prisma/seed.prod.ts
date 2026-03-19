import { Prisma, PrismaClient } from '@prisma/client';

const runtimeUrl = process.env.DATABASE_URL;
const fallbackDirectUrl = process.env.DIRECT_URL;
const seedUrl = runtimeUrl || fallbackDirectUrl;

const prisma = new PrismaClient({
  datasources: seedUrl
    ? {
        db: {
          url: seedUrl,
        },
      }
    : undefined,
});

function getConnectionIdentity(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port || '5432',
    database: parsed.pathname.replace(/^\//, ''),
  };
}

function assertSeedTargetsRuntimeDatabase() {
  if (!runtimeUrl) {
    throw new Error('DATABASE_URL is missing. Production seed requires DATABASE_URL.');
  }

  if (!fallbackDirectUrl) {
    return;
  }

  try {
    const runtimeIdentity = getConnectionIdentity(runtimeUrl);
    const directIdentity = getConnectionIdentity(fallbackDirectUrl);

    const isSameDatabase =
      runtimeIdentity.host === directIdentity.host &&
      runtimeIdentity.port === directIdentity.port &&
      runtimeIdentity.database === directIdentity.database;

    if (!isSameDatabase) {
      throw new Error(
        [
          'DATABASE_URL and DIRECT_URL point to different databases.',
          `DATABASE_URL => ${runtimeIdentity.host}:${runtimeIdentity.port}/${runtimeIdentity.database}`,
          `DIRECT_URL => ${directIdentity.host}:${directIdentity.port}/${directIdentity.database}`,
          'Seed aborted to avoid writing data into a different database than the app runtime.',
        ].join(' ')
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to validate DATABASE_URL and DIRECT_URL consistency.');
  }
}

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

const PROFILE_IMAGES = [
  '/dummy_icons/profile1.jpg',
  '/dummy_icons/profile2.jpg',
  '/dummy_icons/profile3.jpg',
  '/dummy_icons/profile4.jpg',
] as const;

const POST_IMAGES = [
  '/dummy_mainpic/comsci.jpg',
  '/dummy_mainpic/engineering.jpeg',
  '/dummy_mainpic/english1.jpg',
  '/dummy_mainpic/math1.webp',
  '/dummy_mainpic/psychology.jpg',
  '/dummy_mainpic/science1.jpg',
] as const;

const SEEDED_USERS = [
  {
    email: 'rainer_gonzaga@dlsu.edu.ph',
    name: 'Rainer Gonzaga',
    username: 'rgonzaga',
    image: PROFILE_IMAGES[0],
    role: 'admin',
  },
  {
    email: 'duncan_marcaida@dlsu.edu.ph',
    name: 'Duncan Joseph Marcaida',
    username: 'djmarcaida',
    image: PROFILE_IMAGES[1],
    role: 'moderator',
  },
  {
    email: 'elkan_lamadrid@dlsu.edu.ph',
    name: 'Elkan La Madrid',
    username: 'elamadrid',
    image: PROFILE_IMAGES[2],
    role: 'user',
  },
  {
    email: 'mariel_yasumuro@dlsu.edu.ph',
    name: 'Mariel Yasumuro',
    username: 'myasumuro',
    image: PROFILE_IMAGES[3],
    role: 'user',
  },
] as const;

const SEEDED_POSTS = [
  {
    key: 'calc-limits',
    title: 'Study tips for limits and continuity',
    topic: 'limits and continuity',
    categorySlug: 'ccs',
    authorEmail: 'rainer_gonzaga@dlsu.edu.ph',
    image: POST_IMAGES[3],
  },
  {
    key: 'calc-derivatives',
    title: 'Common mistakes in derivatives',
    topic: 'derivatives',
    categorySlug: 'gcoe',
    authorEmail: 'duncan_marcaida@dlsu.edu.ph',
    image: POST_IMAGES[1],
  },
  {
    key: 'bio-cells',
    title: 'Quick notes on cell structure',
    topic: 'cell structure',
    categorySlug: 'cos',
    authorEmail: 'elkan_lamadrid@dlsu.edu.ph',
    image: POST_IMAGES[5],
  },
  {
    key: 'chem-bonding',
    title: 'Best resources to learn chemical bonding',
    topic: 'chemical bonding',
    categorySlug: 'cos',
    authorEmail: 'mariel_yasumuro@dlsu.edu.ph',
    image: POST_IMAGES[5],
  },
  {
    key: 'history-ww2',
    title: 'Summary: World War II in 10 points',
    topic: 'World War II',
    categorySlug: 'cla',
    authorEmail: 'rainer_gonzaga@dlsu.edu.ph',
    image: POST_IMAGES[2],
  },
  {
    key: 'art-renaissance',
    title: 'What surprised you about Renaissance art?',
    topic: 'Renaissance art',
    categorySlug: 'cla',
    authorEmail: 'duncan_marcaida@dlsu.edu.ph',
    image: POST_IMAGES[2],
  },
  {
    key: 'lit-poetry',
    title: 'Help me understand poetic devices',
    topic: 'poetic devices',
    categorySlug: 'cla',
    authorEmail: 'elkan_lamadrid@dlsu.edu.ph',
    image: null,
  },
  {
    key: 'lit-shakespeare',
    title: 'Question about Shakespearean themes',
    topic: 'Shakespearean themes',
    categorySlug: 'cla',
    authorEmail: 'mariel_yasumuro@dlsu.edu.ph',
    image: null,
  },
  {
    key: 'lang-french',
    title: 'How I review basic French grammar',
    topic: 'basic French grammar',
    categorySlug: 'bagced',
    authorEmail: 'rainer_gonzaga@dlsu.edu.ph',
    image: POST_IMAGES[0],
  },
  {
    key: 'lang-japanese',
    title: 'Share your notes on Japanese particles',
    topic: 'Japanese particles',
    categorySlug: 'bagced',
    authorEmail: 'duncan_marcaida@dlsu.edu.ph',
    image: POST_IMAGES[0],
  },
  {
    key: 'skills-time',
    title: 'Time management for exam week',
    topic: 'time management',
    categorySlug: 'rvrcob',
    authorEmail: 'elkan_lamadrid@dlsu.edu.ph',
    image: POST_IMAGES[4],
  },
  {
    key: 'skills-notes',
    title: 'Note-taking systems that actually work',
    topic: 'note-taking systems',
    categorySlug: 'soe',
    authorEmail: 'mariel_yasumuro@dlsu.edu.ph',
    image: POST_IMAGES[4],
  },
] as const;

function buildContent(topic: string, categoryName: string) {
  return [
    `<p>Here are my notes on ${topic} for ${categoryName}. I tried to keep this concise and practical.</p>`,
    '<ul>',
    '<li>Main idea and definition in one sentence.</li>',
    '<li>Key steps or rules to remember.</li>',
    '<li>One quick example or application.</li>',
    '<li>Common pitfalls and how to avoid them.</li>',
    '</ul>',
    '<p>If you have a better explanation or a shortcut, please share it!</p>',
  ].join('');
}

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

async function seedUsers() {
  const usersByEmail = new Map<string, { id: string }>();

  for (const user of SEEDED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });

    let saved;
    try {
      if (existing) {
        saved = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: user.name,
            username: user.username,
            image: user.image,
            role: user.role,
            emailVerified: true,
          },
        });
      } else {
        saved = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.image,
            role: user.role,
            emailVerified: true,
          },
        });
      }
    } catch (error) {
      const isUniqueError =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (!isUniqueError) throw error;

      // If username is already taken by another account, proceed without forcing username.
      if (existing) {
        saved = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: true,
          },
        });
      } else {
        saved = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: true,
          },
        });
      }

      console.warn(`Username conflict for ${user.email}; continued without forcing username.`);
    }

    usersByEmail.set(user.email, { id: saved.id });
  }

  return usersByEmail;
}

async function seedPostsAndEngagement(usersByEmail: Map<string, { id: string }>) {
  const categories = await prisma.category.findMany({
    where: { slug: { in: CATEGORY_DATA.map((c) => c.slug) } },
  });
  const categoriesBySlug = new Map(categories.map((c) => [c.slug, c]));

  const postsByKey = new Map<string, { id: string }>();

  for (const post of SEEDED_POSTS) {
    const category = categoriesBySlug.get(post.categorySlug);
    const author = usersByEmail.get(post.authorEmail);

    if (!category || !author) continue;

    const created = await prisma.post.upsert({
      where: { id: `seed-prod-post-${post.key}` },
      update: {
        title: post.title,
        content: buildContent(post.topic, category.name),
        image: post.image,
        authorId: author.id,
        categoryId: category.id,
        isAnonymous: false,
        deletedAt: null,
      },
      create: {
        id: `seed-prod-post-${post.key}`,
        title: post.title,
        content: buildContent(post.topic, category.name),
        image: post.image,
        authorId: author.id,
        categoryId: category.id,
        isAnonymous: false,
      },
    });

    postsByKey.set(post.key, { id: created.id });
  }

  for (const post of SEEDED_POSTS) {
    const savedPost = postsByKey.get(post.key);
    if (!savedPost) continue;

    const commenterEmails = [
      'rainer_gonzaga@dlsu.edu.ph',
      'duncan_marcaida@dlsu.edu.ph',
      'elkan_lamadrid@dlsu.edu.ph',
      'mariel_yasumuro@dlsu.edu.ph',
    ];

    for (let i = 0; i < 2; i += 1) {
      const commenter = usersByEmail.get(
        commenterEmails[(i + post.key.length) % commenterEmails.length]
      );
      if (!commenter) continue;

      await prisma.comment.upsert({
        where: { id: `seed-prod-comment-${post.key}-${i + 1}` },
        update: {
          content: `I like this topic. Here is my quick take #${i + 1}.`,
          authorId: commenter.id,
          postId: savedPost.id,
          isAnonymous: false,
          deletedAt: null,
        },
        create: {
          id: `seed-prod-comment-${post.key}-${i + 1}`,
          content: `I like this topic. Here is my quick take #${i + 1}.`,
          authorId: commenter.id,
          postId: savedPost.id,
          isAnonymous: false,
        },
      });
    }

    for (const [email, user] of usersByEmail.entries()) {
      const voteValue = email === post.authorEmail ? 1 : 1;
      await prisma.vote.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId: savedPost.id,
          },
        },
        update: { value: voteValue },
        create: {
          userId: user.id,
          postId: savedPost.id,
          value: voteValue,
        },
      });
    }

    for (const user of usersByEmail.values()) {
      await prisma.bookmark.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId: savedPost.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          postId: savedPost.id,
        },
      });
    }
  }
}

async function seedAnnouncements(usersByEmail: Map<string, { id: string }>) {
  const admin = usersByEmail.get('rainer_gonzaga@dlsu.edu.ph');
  if (!admin) return;

  await prisma.announcement.upsert({
    where: { id: 'seed-prod-announcement-1' },
    update: {
      title: 'Welcome to AnimoNotes!',
      content: 'Share your notes and help fellow students succeed. Check out the latest posts!',
      type: 'info',
      isActive: true,
      createdBy: admin.id,
    },
    create: {
      id: 'seed-prod-announcement-1',
      title: 'Welcome to AnimoNotes!',
      content: 'Share your notes and help fellow students succeed. Check out the latest posts!',
      type: 'info',
      isActive: true,
      createdBy: admin.id,
    },
  });
}

async function main() {
  assertSeedTargetsRuntimeDatabase();

  console.log('Starting production-safe seed...');
  console.log('No destructive operations will be executed.');

  console.log('Seeding categories...');
  await seedCategories();

  console.log('Seeding users...');
  const usersByEmail = await seedUsers();

  console.log('Seeding posts, comments, votes, and bookmarks...');
  await seedPostsAndEngagement(usersByEmail);

  console.log('Seeding announcements...');
  await seedAnnouncements(usersByEmail);

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
