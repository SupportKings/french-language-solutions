import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.fwlfwkxbdabvcyucvetn:fgd@kjy4TRG2wcn9duk@aws-1-ca-central-1.pooler.supabase.com:6543/postgres'
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Check if Better Auth tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'verification', 'account', 'passkey')
    `);
    
    console.log('\n📊 Better Auth tables found:');
    if (tablesResult.rows.length === 0) {
      console.log('❌ No Better Auth tables found! They need to be created.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();