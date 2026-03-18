import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { APIError, createAuthMiddleware } from 'better-auth/api';

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
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  socialProviders: hasGoogle
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  // intercept standard email/password logins
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-in/email') {
        const email = ctx.body?.email?.toLowerCase() ?? '';
        if (!email.endsWith('@dlsu.edu.ph')) {
          throw new APIError('FORBIDDEN', {
            message: 'Only @dlsu.edu.ph emails are allowed.',
          });
        }
      }
    }),
  },

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
  account: {
    fields: {
      providerId: 'provider',
      accountId: 'providerAccountId',
      refreshToken: 'refresh_token',
      accessToken: 'access_token',
      accessTokenExpiresAt: 'expires_at',
      tokenType: 'token_type',
      idToken: 'id_token',
      sessionState: 'session_state',
    },
  },
  session: {
    fields: {
      token: 'sessionToken',
      expiresAt: 'expires',
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email?.toLowerCase() ?? '';
          if (!email.endsWith('@dlsu.edu.ph')) {
            throw new APIError('FORBIDDEN', {
              message: 'Only @dlsu.edu.ph emails are allowed.',
            });
          }
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
