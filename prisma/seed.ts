// seed prisma schema with timezones form ./seedData/timezones.json

import { PrismaClient, type Timezone } from '@prisma/client';
import type { PickAndFlatten } from '@/lib/helper';
// import { env } from '@/env.mjs';

import timezoneData from './seedData/timezones.json';
import interactionTypeData from './seedData/interactionTypes.json';

const prisma = new PrismaClient();

type TimezoneNoId = PickAndFlatten<
  Omit<Timezone, 'id' | 'createdAt' | 'updatedAt'>
>;

const timezones: TimezoneNoId[] = timezoneData.map((timezone) => {
  return {
    name: timezone.timezone,
    nameShort: timezone.name,
    offset: timezone.offset,
  };
});

const interactionTypes = interactionTypeData.map((interactionType) => {
  return {
    name: interactionType.name,
  };
});

async function main() {
  // TIMEZONES
  if (process.env.NODE_ENV === 'development')
    await prisma.timezone.deleteMany();
  for (let i = 0; i < timezones.length; i++) {
    const timezone = timezones[i];
    if (timezone)
      await prisma.timezone.create({
        data: {
          id: i + 1,
          ...timezone,
        },
      });
  }

  // INTERACTION TYPES
  if (process.env.NODE_ENV === 'development')
    await prisma.interactionType.deleteMany();
  for (let i = 0; i < interactionTypes.length; i++) {
    const interactionType = interactionTypes[i];
    if (interactionType)
      await prisma.interactionType.create({
        data: {
          ...interactionType,
        },
      });
  }
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
