import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { clientIp, isLimited, normalizeEmail, recordHit, resetKey } from "@/lib/rate-limit";

const SIGNIN_PAIR_LIMIT = 5;
const SIGNIN_PAIR_WINDOW_MS = 10 * 60 * 1000;
const SIGNIN_ACCOUNT_LIMIT = 10;
const SIGNIN_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;
const SIGNIN_IP_LIMIT = 20;
const SIGNIN_IP_WINDOW_MS = 10 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) return null;

        const email = normalizeEmail(credentials.email);
        const ip = clientIp(req?.headers ?? {});
        const keys = {
          pair: `signin:${ip}:${email}`,
          account: `signin:acct:${email}`,
          ip: `signin:ip:${ip}`
        };

        // Only failed attempts count, so legitimate sign-ins never trip the limits.
        if (
          isLimited(keys.pair, SIGNIN_PAIR_LIMIT).limited ||
          isLimited(keys.account, SIGNIN_ACCOUNT_LIMIT).limited ||
          isLimited(keys.ip, SIGNIN_IP_LIMIT).limited
        ) {
          throw new Error("RATE_LIMITED");
        }

        const fail = () => {
          recordHit(keys.pair, SIGNIN_PAIR_WINDOW_MS);
          recordHit(keys.account, SIGNIN_ACCOUNT_WINDOW_MS);
          recordHit(keys.ip, SIGNIN_IP_WINDOW_MS);
          return null;
        };

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user?.passwordHash) return fail();

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return fail();

        resetKey(keys.pair);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "USER");
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export function requireAdminRole(role?: string) {
  if (role !== "ADMIN" && role !== "EDITOR") {
    throw new Error("Admin access required.");
  }
}
