import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { prisma } from '@/lib/prisma';

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = betterAuth({
  appName: 'AnimoNotes',
  baseURL,
  trustedOrigins: [baseURL],
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: 'online',
      hd: 'dlsu.edu.ph',
      prompt: 'select_account',
      allowedDomains: ['dlsu.edu.ph'],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ['user', 'moderator', 'admin'],
        defaultValue: 'user',
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      disableImplicitLinking: false,
      trustedProviders: ['google'],
    },
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
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  },
  plugins: [
    nextCookies(),
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
});
