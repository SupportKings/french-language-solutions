// COMMENTED OUT: This drizzle setup is not used in production, app uses Supabase
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import * as schema from "./schema";

// // Create a connection pool for better performance
// const pool = new Pool({
// 	connectionString: process.env.DATABASE_URL,
// 	max: 20, // Maximum number of clients in the pool
// 	idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
// 	connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
// });

// // Create the drizzle instance with schema for type safety
// export const db = drizzle(pool, { schema });

// Export all schemas for use in other parts of the application
// COMMENTED OUT: Schema exports are not used, app uses Supabase types
// export * from "./schema";

