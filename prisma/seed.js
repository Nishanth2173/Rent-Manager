const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'landlord@demo.com' },
    update: {},
    create: {
      email: 'landlord@demo.com',
      name: 'Rajesh Kumar',
      password: hashedPassword,
      phone: '+91-9876543210',
      role: 'LANDLORD',
    },
  });

  console.log('Created user:', user.email);

  // Create demo tenants
  const tenantsData = [
    {
      name: 'Arjun Sharma',
      mobile: '9876543201',
      propertyNo: 'A-101',
      monthlyRent: 12000,
      rentDueDay: 5,
      joiningDate: new Date('2024-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Priya Patel',
      mobile: '9876543202',
      propertyNo: 'A-102',
      monthlyRent: 10000,
      rentDueDay: 10,
      joiningDate: new Date('2024-02-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Rahul Verma',
      mobile: '9876543203',
      propertyNo: 'B-201',
      monthlyRent: 15000,
      rentDueDay: 1,
      joiningDate: new Date('2023-12-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Sneha Reddy',
      mobile: '9876543204',
      propertyNo: 'B-202',
      monthlyRent: 8000,
      rentDueDay: 15,
      joiningDate: new Date('2024-03-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Vikram Singh',
      mobile: '9876543205',
      propertyNo: 'C-301',
      monthlyRent: 20000,
      rentDueDay: 3,
      joiningDate: new Date('2024-01-15'),
      status: 'INACTIVE',
    },
  ];

  for (const tenantData of tenantsData) {
    const tenant = await prisma.tenant.upsert({
      where: { id: tenantData.propertyNo + user.id },
      update: {},
      create: {
        ...tenantData,
        userId: user.id,
      },
    });

    // Generate rent records for last 4 months
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const rentMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Due date = rentDueDay of the NEXT month (May rent → collected in June)
      const dueDate = new Date(rentMonth.getFullYear(), rentMonth.getMonth() + 1, tenant.rentDueDay);

      const isPaid = i > 1 ? Math.random() > 0.3 : false;
      const isOverdue = !isPaid && dueDate < now;

      const record = await prisma.rentRecord.upsert({
        where: {
          tenantId_rentMonth: {
            tenantId: tenant.id,
            rentMonth,
          },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          rentMonth,
          dueDate,
          amount: tenant.monthlyRent,
          status: isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING',
          paidAt: isPaid ? new Date(dueDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
          paidAmount: isPaid ? tenant.monthlyRent : null,
        },
      });

      if (isPaid) {
        await prisma.payment.create({
          data: {
            rentRecordId: record.id,
            amount: tenant.monthlyRent,
            paymentDate: record.paidAt,
            method: ['CASH', 'UPI', 'BANK_TRANSFER'][Math.floor(Math.random() * 3)],
          },
        });
      }
    }

    console.log('Created tenant with rent records:', tenant.name);
  }

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
