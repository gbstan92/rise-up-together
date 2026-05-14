import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma, no Node-only imports. Used by middleware and
// extended by src/lib/auth.ts which adds the Credentials provider authorize
// callback (that one needs Prisma and must run in the Node runtime).
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.uid = user.id as string;
      return token;
    },
    session: ({ session, token }) => {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
