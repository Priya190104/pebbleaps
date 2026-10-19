import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Makanan", color: "#F5C4A8", icon: "🍱", forIncome: false },
  { name: "Transport", color: "#B4D4F0", icon: "🚌", forIncome: false },
  { name: "Belanja", color: "#F5D9A8", icon: "🛍️", forIncome: false },
  { name: "Hiburan", color: "#B8EDD3", icon: "🎮", forIncome: false },
  { name: "Kesehatan", color: "#FFD9C4", icon: "💊", forIncome: false },
  { name: "Tabungan", color: "#D4F5E5", icon: "🏦", forIncome: false },
  { name: "Pendapatan", color: "#8ADAB5", icon: "💰", forIncome: true },
  { name: "Gaji", color: "#D4F5E5", icon: "💼", forIncome: true },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }) {
      // Seed default categories + room settings on first login
      await Promise.all([
        prisma.category.createMany({
          data: DEFAULT_CATEGORIES.map((c) => ({
            ...c,
            userId: user.id!,
            isDefault: true,
            isSavings: c.name === "Tabungan",
          })),
        }),
        prisma.roomSettings.create({
          data: {
            userId: user.id!,
            roomName: "Ruanganku",
            userName: user.name?.split(" ")[0] ?? "Teman",
          },
        }),
      ]);
    },
  },
});
