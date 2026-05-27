import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Skipping admin seed: ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.ADMIN },
    create: {
      email,
      name: "Optimais Admin",
      passwordHash,
      role: Role.ADMIN
    }
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
