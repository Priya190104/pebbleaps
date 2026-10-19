import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Called automatically by NextAuth event on first login
// This script can also be run manually: npx tsx prisma/seed.ts
async function main() {
  console.log("Seed complete — default categories are seeded per user on first login via NextAuth event.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
