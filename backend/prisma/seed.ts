import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not configured.');
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

const roles = [
    {
        name: 'OWNER',
        description: 'Workspace owner with full access.',
    },
    {
        name: 'ADMIN',
        description: 'Workspace admin with management access.',
    },
    {
        name: 'MEMBER',
        description: 'Regular workspace member.',
    },
];

async function main() {
    console.log('Seeding default roles...');

    for (const role of roles) {
        await prisma.role.upsert({
            where: {
                name: role.name,
            },
            update: {
                description: role.description,
            },
            create: {
                name: role.name,
                description: role.description,
            },
        });
    }

    console.log('Default roles seeded successfully.');
}

main()
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });