import { PrismaClient } from "@prisma/client";
import { GHANA_REGIONS } from "../lib/ghana-regions";

const prisma = new PrismaClient();

// Idempotent (upsert-based) on purpose — unlike prisma/seed.ts (a one-shot
// fresh-database fixture that creates duplicate rows if run twice), this
// needs to run safely against a database that already has real data, since
// it's also called from prisma/seed.ts for fresh installs.
export async function seedRegionsAndDistricts(): Promise<void> {
  for (const [regionName, districts] of Object.entries(GHANA_REGIONS)) {
    const region = await prisma.region.upsert({
      where: { name: regionName },
      update: {},
      create: { name: regionName },
    });

    for (const districtName of districts) {
      await prisma.district.upsert({
        where: { regionId_name: { regionId: region.id, name: districtName } },
        update: {},
        create: { name: districtName, regionId: region.id },
      });
    }
  }
}

if (require.main === module) {
  seedRegionsAndDistricts()
    .then(() => console.log("Regions/Districts seeded."))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
