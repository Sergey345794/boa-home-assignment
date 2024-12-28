import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.themeSettings.create({
    data: {
      text: "Welcome to your saved cart feature!",
      textColor: "#333333",
      backgroundColor: "#f5f5f5",
    },
  });
  
  console.log("Seed data created:", result);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });