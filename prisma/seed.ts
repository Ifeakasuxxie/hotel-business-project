import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const roleSeeds: Array<{
  name: UserRole;
  description: string;
  permissions: string[];
}> = [
  {
    name: UserRole.CUSTOMER,
    description: "Registered hotel guest",
    permissions: ["bookings:create", "bookings:read:own", "reviews:create"],
  },
  {
    name: UserRole.STAFF,
    description: "Front-line hotel staff",
    permissions: ["bookings:read", "bookings:update", "restaurant:manage"],
  },
  {
    name: UserRole.MANAGER,
    description: "Hotel management",
    permissions: [
      "users:read",
      "bookings:manage",
      "payments:manage",
      "reviews:manage",
    ],
  },
  {
    name: UserRole.CONCIERGE,
    description: "Concierge team",
    permissions: ["bookings:create", "bookings:read", "reservations:manage"],
  },
  {
    name: UserRole.ADMIN,
    description: "System administrator",
    permissions: ["*"],
  },
];

async function main() {
  for (const role of roleSeeds) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, permissions: role.permissions },
      create: role,
    });
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: UserRole.ADMIN },
  });

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ?? "admin@thekingshotel.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin && adminRole) {
    const passwordHash = await hash(
      process.env.SEED_ADMIN_PASSWORD ?? "Admin123!",
      10,
    );
    await prisma.user.create({
      data: {
        firstName: "Site",
        lastName: "Administrator",
        name: "Site Administrator",
        email: adminEmail,
        passwordHash,
        roleId: adminRole.id,
        emailVerified: true,
      },
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  console.log("Database seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
