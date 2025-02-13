import { PrismaClient, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { tags } from '../src/shared/constants/tags';

const prisma = new PrismaClient();

const NUMBER_OF_USERS = 50;

async function main() {
  console.log('Start seeding users...');

  // Delete existing users
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  // Add the tags to the database
  await Promise.all(
    tags.map((tag) => prisma.tag.create({ data: { name: tag } })),
  );

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@plock.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: '$2a$12$z5rgpY.LmWsUA63EL0q5V.2NKn4uXq2Y0Rz53mG1u6k0n8fX1ci5i', // 'aaAA11++'
      phoneNumber: faker.phone.number(),
      birthDate: faker.date.past().toISOString().split('T')[0],
      role: UserRole.ADMIN,
      isPrivate: false,
      pofilePic: faker.image.avatar(),
      lastLogin: new Date(),
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create regular users
  for (let i = 0; i < NUMBER_OF_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        username: faker.internet
          .userName({ firstName, lastName })
          .toLowerCase(),
        firstName,
        lastName,
        password:
          '$2a$12$z5rgpY.LmWsUA63EL0q5V.2NKn4uXq2Y0Rz53mG1u6k0n8fX1ci5i', // 'aaAA11++'
        phoneNumber: faker.phone.number({ style: 'international' }),
        birthDate: faker.date.past().toISOString().split('T')[0],
        role: UserRole.USER,
        isPrivate: faker.datatype.boolean(),
        pofilePic: faker.image.avatar(),
        lastLogin: faker.date.recent(),
      },
    });
    console.log('Created user:', user.email);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
