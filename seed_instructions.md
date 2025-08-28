I have a database schema created with Drizzle ORM and I need to generate a comprehensive seed script. Please create a complete seed.ts file based on my entities and requirements.

  ## Project Context:
  - Location: server/src/db/seed.ts
  - Framework: Drizzle ORM with PostgreSQL
  - Runtime: Bun
  - Faker library: @faker-js/faker for generating realistic test data
  - Database: PostgreSQL (Supabase)

  ## Requirements:

  ### 1. Seed Script Structure:
  ```typescript
  import { db } from "./index";
  import {
    // Import all tables from schema
    clients,
    products,
    orders,
    // ... other tables
  } from "./schema";
  import { faker } from "@faker-js/faker";
  import { eq } from "drizzle-orm";

  async function seed() {
    console.log("🌱 Starting seed...");

    // 1. Clear existing data (in reverse dependency order)
    // 2. Seed lookup/reference tables first
    // 3. Seed main entities
    // 4. Seed relationship/junction tables
    // 5. Summary report
  }

  // Execute with error handling
  seed()
    .then(() => {
      console.log("🎉 Database seeded successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding database:", error);
      process.exit(1);
    });

  2. Data Clearing Pattern:

  Clear data in REVERSE order of dependencies to avoid foreign key violations:
  console.log("🗑️ Clearing existing data...");
  // Clear junction tables first
  await db.delete(orderItems);      // Has FKs to orders and products
  await db.delete(clientAddresses); // Has FK to clients
  await db.delete(orders);          // Has FK to clients
  await db.delete(clients);         // Has FK to companies
  await db.delete(products);        // Has FK to categories
  await db.delete(companies);       // Independent
  await db.delete(categories);      // Independent

  3. Seeding Patterns:

  A. Lookup/Reference Tables (seed first):

  // Example: Status/Level tables with specific values
  console.log("🌐 Seeding reference data...");
  const statusData = [
    { code: 'active', displayName: 'Active', sortOrder: 1 },
    { code: 'inactive', displayName: 'Inactive', sortOrder: 2 },
    { code: 'pending', displayName: 'Pending', sortOrder: 3 },
  ];
  const insertedStatuses = await db.insert(statuses).values(statusData).returning();
  console.log(`✅ Inserted ${insertedStatuses.length} statuses`);

  B. Main Entities with Faker:

  console.log("👥 Seeding clients...");
  const clientsData = Array.from({ length: 100 }, () => ({
    // Basic fields
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    phoneNumber: faker.phone.number('+1-###-###-####'),

    // Dates
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),

    // Enums - use weighted selection for realistic distribution
    status: faker.helpers.weightedArrayElement([
      { weight: 5, value: "active" },
      { weight: 2, value: "inactive" },
      { weight: 3, value: "pending" },
    ]),

    // Foreign keys - reference already inserted data
    companyId: faker.helpers.arrayElement(insertedCompanies).id,

    // JSON fields with typed structure
    preferences: {
      notifications: faker.datatype.boolean(),
      newsletter: faker.datatype.boolean({ probability: 0.7 }), // 70% true
      language: faker.helpers.arrayElement(['en', 'fr', 'es']),
    },

    // Numeric fields
    creditLimit: faker.number.int({ min: 1000, max: 50000 }),
    loyaltyPoints: faker.number.int({ min: 0, max: 10000 }),

    // Boolean fields
    isActive: faker.datatype.boolean({ probability: 0.8 }), // 80% active
    isVerified: faker.datatype.boolean({ probability: 0.6 }),

    // Optional fields (use conditional)
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,

    // Arrays
    tags: faker.helpers.arrayElements(
      ['vip', 'wholesale', 'retail', 'preferred', 'new'],
      { min: 0, max: 3 }
    ),
  }));

  const insertedClients = await db.insert(clients).values(clientsData).returning();
  console.log(`✅ Inserted ${insertedClients.length} clients`);

  C. Dependent/Related Data:

  console.log("📦 Seeding orders...");
  const ordersData = [];

  // Create realistic distribution - some clients have many orders, some have none
  for (const client of insertedClients) {
    // Weighted distribution of order counts
    const orderCount = faker.helpers.weightedArrayElement([
      { weight: 3, value: 0 },  // 30% have no orders
      { weight: 4, value: faker.number.int({ min: 1, max: 3 }) },  // 40% have 1-3
      { weight: 2, value: faker.number.int({ min: 4, max: 10 }) }, // 20% have 4-10
      { weight: 1, value: faker.number.int({ min: 11, max: 20 }) }, // 10% have many
    ]);

    for (let i = 0; i < orderCount; i++) {
      ordersData.push({
        clientId: client.id,
        orderNumber: faker.string.alphanumeric(10).toUpperCase(),
        orderDate: faker.date.recent({ days: 365 }),
        status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        totalAmount: faker.number.float({ min: 50, max: 5000, precision: 0.01 }),
        shippingAddressId: faker.helpers.arrayElement(client.addresses)?.id || null,
      });
    }
  }

  const insertedOrders = await db.insert(orders).values(ordersData).returning();
  console.log(`✅ Inserted ${insertedOrders.length} orders`);

  D. Many-to-Many Junction Tables:

  console.log("🔗 Seeding client-product relationships...");
  const clientProductsData = [];

  // Create realistic associations
  for (const client of insertedClients.slice(0, 50)) { // Only some clients
    const productCount = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = faker.helpers.arrayElements(insertedProducts, productCount);

    for (const product of selectedProducts) {
      clientProductsData.push({
        clientId: client.id,
        productId: product.id,
        addedAt: faker.date.recent({ days: 90 }),
        isFavorite: faker.datatype.boolean({ probability: 0.3 }),
      });
    }
  }

  const insertedClientProducts = await db.insert(clientProducts).values(clientProductsData).returning();
  console.log(`✅ Inserted ${insertedClientProducts.length} client-product relationships`);

  4. Realistic Data Generation Tips:

  Use weighted distributions for realistic data:

  // Status distribution that mirrors real-world scenarios
  const status = faker.helpers.weightedArrayElement([
    { weight: 60, value: "active" },      // 60% active
    { weight: 25, value: "inactive" },    // 25% inactive  
    { weight: 10, value: "suspended" },   // 10% suspended
    { weight: 5, value: "pending" },      // 5% pending
  ]);

  // Date ranges for different scenarios
  const accountCreatedAt = faker.date.between({
    from: '2020-01-01',
    to: new Date(),
  });

  // Conditional relationships
  const hasCompany = faker.datatype.boolean({ probability: 0.3 }); // 30% are B2B
  const companyId = hasCompany ? faker.helpers.arrayElement(insertedCompanies).id : null;

  // Correlated fields
  const isPremium = client.totalSpent > 10000;
  const tier = isPremium ? 'gold' : faker.helpers.arrayElement(['bronze', 'silver']);

  Generate consistent related data:

  // Phone numbers with consistent country codes
  const country = faker.helpers.arrayElement(['US', 'CA', 'UK']);
  const phoneFormat = {
    'US': '+1-###-###-####',
    'CA': '+1-###-###-####',
    'UK': '+44-##-####-####',
  }[country];
  const phoneNumber = faker.phone.number(phoneFormat);

  // Email addresses that match names
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({
    firstName,
    lastName,
    provider: faker.helpers.arrayElement(['gmail.com', 'yahoo.com', 'company.com'])
  }).toLowerCase();

  5. Seed Data Volumes:

  Specify the number of records for each entity:
  - Reference tables: Complete set (all possible values)
  - Main entities: 50-500 records
  - Transactions: 100-1000 records
  - Junction tables: Realistic relationships (not all combinations)

  entities.md Example for Seeding:

  # Seed Requirements

  ## Data Volumes
  - clients: 200 records
  - products: 50 records
  - orders: 500 records (distributed across clients)
  - categories: 10 records (fixed list)

  ## Business Rules for Seeding
  - 70% of clients should be active
  - 30% of clients belong to companies (B2B)
  - Average 2.5 orders per client (some with 0, some with 10+)
  - Order dates within last 12 months
  - Premium clients (>$10k spent) get gold tier automatically

  ## Test Scenarios to Include
  1. Clients with no orders (for testing empty states)
  2. Clients with many addresses (for pagination testing)
  3. Orders in various statuses (for workflow testing)
  4. Some deleted records (soft deletes) for testing filters

  ## Fixed Test Data
  Include these specific records for testing:
  - Email: test@example.com (for login testing)
  - Client: "John Doe" (for demo purposes)
  - Product: "Sample Product" with SKU "TEST-001"

  6. Summary Output:

  console.log("\n✨ Seed completed successfully!");
  console.log(`
  📊 Summary:
  - ${insertedClients.length} clients
  - ${insertedProducts.length} products
  - ${insertedOrders.length} orders
  - ${insertedAddresses.length} addresses
  - ${insertedClientProducts.length} client-product relationships

  📈 Statistics:
  - Active clients: ${insertedClients.filter(c => c.status === 'active').length}
  - B2B clients: ${insertedClients.filter(c => c.companyId).length}
  - Average orders per client: ${(insertedOrders.length / insertedClients.length).toFixed(2)}
  - Total order value: $${ordersData.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
  `);

  Please generate a complete seed script that:
  1. Clears existing data safely
  2. Seeds all tables with realistic test data
  3. Maintains referential integrity
  4. Uses faker for realistic data
  5. Includes proper error handling
  6. Provides a summary of seeded data
  7. Can be run repeatedly (idempotent)