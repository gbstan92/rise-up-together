import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { Locale, PageKey, PublishStatus } from "../src/generated/prisma/enums";

const prisma = new PrismaClient();

const PAGE_TITLES: Record<PageKey, { ro: string; en: string }> = {
  HOME: { ro: "Acasă", en: "Home" },
  WHO_WE_ARE: { ro: "Cine suntem", en: "Who we are" },
  WHAT_WE_DO: { ro: "Ce facem", en: "What we do" },
  GET_INVOLVED: { ro: "Implică-te", en: "Get involved" },
  PRIVACY: {
    ro: "Politica de confidențialitate",
    en: "Privacy policy",
  },
};

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("[seed] SEED_ADMIN_EMAIL/PASSWORD not set — skipping admin user");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Admin" },
  });
  console.log(`[seed] admin user ready: ${user.email}`);
}

async function seedPages() {
  for (const key of Object.keys(PAGE_TITLES) as PageKey[]) {
    const titles = PAGE_TITLES[key];
    await prisma.pageContent.upsert({
      where: { key },
      update: {},
      create: {
        key,
        status: PublishStatus.DRAFT,
        translations: {
          create: [
            { locale: Locale.RO, title: titles.ro },
            { locale: Locale.EN, title: titles.en },
          ],
        },
      },
    });
  }
  console.log("[seed] page content rows ready");
}

async function main() {
  await seedAdmin();
  await seedPages();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
