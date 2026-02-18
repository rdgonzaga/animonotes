import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORY_DATA = [
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

const USER_NAMES = ['Duncan Marcaida', 'Elkan La Madrid', 'Mariel Yasumuro', 'Rainer Gonzaga'];

const TITLE_SNIPPETS = [
  'Study tips for finals week',
  'Quick notes on {topic}',
  'Best resources to learn {topic}',
  'Question about {topic}',
  'Share your notes on {topic}',
  'What surprised you about {topic}?',
  'Help me understand {topic}',
  'Summary: {topic} in 10 points',
  'Common mistakes in {topic}',
  'How I review {topic}',
];

const TOPICS = [
  'limits and continuity',
  'derivatives',
  'cell structure',
  'chemical bonding',
  'World War II',
  'Renaissance art',
  'poetic devices',
  'Shakespearean themes',
  'basic French grammar',
  'Japanese particles',
  'time management',
  'note-taking systems',
];

const PROFILE_IMAGES = [
  '/dummy_icons/profile1.jpg',
  '/dummy_icons/profile2.jpg',
  '/dummy_icons/profile3.jpg',
  '/dummy_icons/profile4.jpg',
  '/dummy_icons/profile5.jpg',
];

const POST_IMAGES = [
  '/dummy_mainpic/comsci.jpg',
  '/dummy_mainpic/engineering.jpeg',
  '/dummy_mainpic/english1.jpg',
  '/dummy_mainpic/math1.webp',
  '/dummy_mainpic/psychology.jpg',
  '/dummy_mainpic/science1.jpg',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function buildTitle(topic: string) {
  return pickOne(TITLE_SNIPPETS).replace('{topic}', topic);
}

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

async function resetData() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.report.deleteMany(),
    prisma.block.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.pollVote.deleteMany(),
    prisma.pollOption.deleteMany(),
    prisma.poll.deleteMany(),
    prisma.vote.deleteMany(),
    prisma.bookmark.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.postTag.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.post.deleteMany(),
    prisma.category.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('🧹 Resetting existing data...');
  await resetData();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAnswer = await bcrypt.hash('tokyo', 10);

  const users = [] as { id: string; name: string | null }[];

  const createSeedUser = async (data: {
    email: string;
    name: string;
    image: string;
    role: 'user' | 'moderator' | 'admin';
  }) => {
    const email = data.email.toLowerCase();

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: data.name,
          image: data.image,
          password: hashedPassword,
          securityQuestion: 'What is your favorite city?',
          securityAnswer: hashedAnswer,
          role: data.role,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credential',
          providerAccountId: email,
          password: hashedPassword,
        },
      });

      return user;
    });
  };

  const testUser = await createSeedUser({
    email: 'test@animonotes.app',
    name: 'Raikan Joriel Yasgonlarcaida',
    image: PROFILE_IMAGES[0],
    role: 'user',
  });
  users.push({ id: testUser.id, name: testUser.name });

  for (let i = 0; i < USER_NAMES.length; i += 1) {
    const name = USER_NAMES[i];
    const email = `user${i + 1}@animonotes.app`;
    const user = await createSeedUser({
      email,
      image: PROFILE_IMAGES[i],
      name,
      role: 'user',
    });
    users.push({ id: user.id, name: user.name });
  }
  console.log(`✅ Created ${users.length} users`);

  const categories = [] as { id: string; name: string }[];
  for (const category of CATEGORY_DATA) {
    const created = await prisma.category.create({ data: category });
    categories.push({ id: created.id, name: created.name });
  }
  console.log(`✅ Created ${categories.length} categories`);

  const posts = [] as { id: string; title: string }[];
  for (let i = 0; i < 25; i += 1) {
    const author = pickOne(users);
    const category = pickOne(categories);
    const topic = pickOne(TOPICS);
    const post = await prisma.post.create({
      data: {
        title: buildTitle(topic),
        image: Math.random() < 0.7 ? pickOne(POST_IMAGES) : null,
        content: buildContent(topic, category.name),
        authorId: author.id,
        categoryId: category.id,
      },
    });
    posts.push({ id: post.id, title: post.title });
  }
  console.log(`✅ Created ${posts.length} posts`);

  let commentCount = 0;
  for (const post of posts) {
    const total = randomInt(2, 5);
    for (let i = 0; i < total; i += 1) {
      const author = pickOne(users);
      await prisma.comment.create({
        data: {
          content: `I like this topic. Here is my quick take #${i + 1}.`,
          authorId: author.id,
          postId: post.id,
        },
      });
      commentCount += 1;
    }
  }
  console.log(`✅ Created ${commentCount} comments`);

  let voteCount = 0;
  let bookmarkCount = 0;
  for (const post of posts) {
    const voters = users
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, randomInt(3, Math.min(10, users.length)));

    for (const voter of voters) {
      await prisma.vote.create({
        data: {
          userId: voter.id,
          postId: post.id,
          value: Math.random() < 0.8 ? 1 : -1,
        },
      });
      voteCount += 1;
    }

    const bookmarkers = users
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, randomInt(1, Math.min(6, users.length)));

    for (const bookmarker of bookmarkers) {
      await prisma.bookmark.create({
        data: {
          userId: bookmarker.id,
          postId: post.id,
        },
      });
      bookmarkCount += 1;
    }
  }
  console.log(`✅ Created ${voteCount} votes`);
  console.log(`✅ Created ${bookmarkCount} bookmarks`);

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
