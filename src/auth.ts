import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: 'Animo Notes',
  baseURL,
  trustedOrigins: [baseURL],
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: hasGoogle
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  user: {
    additionalFields: {
      role: {
        type: ['user', 'moderator', 'admin'],
        defaultValue: 'user',
        input: false,
      },
      securityQuestion: {
        type: 'string',
        required: false,
      },
      securityAnswer: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const securityAnswer = (user as { securityAnswer?: string }).securityAnswer;
          if (!securityAnswer) {
            return { data: user };
          }
          const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10);
          return { data: { ...user, securityAnswer: hashedAnswer } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
