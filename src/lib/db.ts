import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Q4GTJ3Bqurap@ep-rapid-flower-b43ib5x8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(connectionString);

let tablesInitialized = false;

/**
 * Initializes database tables in Neon PostgreSQL if they do not exist
 */
export async function initDatabase() {
  if (tablesInitialized) return;
  try {
    // 1. Transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(100) PRIMARY KEY,
        receipt_no VARCHAR(100),
        date VARCHAR(50),
        donor_name VARCHAR(255),
        donor_name_urdu VARCHAR(255),
        phone VARCHAR(100),
        address TEXT,
        address_urdu TEXT,
        amount NUMERIC(15, 2) DEFAULT 0,
        amount_in_words_en TEXT,
        amount_in_words_ur TEXT,
        type VARCHAR(50) DEFAULT 'income',
        category_id VARCHAR(100),
        payment_method VARCHAR(50) DEFAULT 'cash',
        bank_name VARCHAR(255),
        check_number VARCHAR(100),
        transaction_id VARCHAR(100),
        description TEXT,
        description_urdu TEXT,
        recorded_by VARCHAR(255),
        verified_by VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure columns exist on transactions table
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255)`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS zila VARCHAR(255)`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sheet_id VARCHAR(100)`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC(15, 2) DEFAULT 0`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS quarterly_amount NUMERIC(15, 2) DEFAULT 0`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS annually_amount NUMERIC(15, 2) DEFAULT 0`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS months_data JSONB DEFAULT '{}'`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sarparast_ala VARCHAR(255)`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS target_amount NUMERIC(15, 2) DEFAULT 0`;

    // 2. Sheet Tabs table
    await sql`
      CREATE TABLE IF NOT EXISTS sheet_tabs (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_urdu VARCHAR(255),
        project_id VARCHAR(100),
        project_name VARCHAR(255),
        project_year VARCHAR(50),
        city_name VARCHAR(100),
        category_filter VARCHAR(100),
        type_filter VARCHAR(50),
        color VARCHAR(50),
        period_type VARCHAR(50),
        period_value VARCHAR(100),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure columns exist on existing table
    await sql`ALTER TABLE sheet_tabs ADD COLUMN IF NOT EXISTS project_id VARCHAR(100)`;
    await sql`ALTER TABLE sheet_tabs ADD COLUMN IF NOT EXISTS project_name VARCHAR(255)`;
    await sql`ALTER TABLE sheet_tabs ADD COLUMN IF NOT EXISTS project_year VARCHAR(50)`;
    await sql`ALTER TABLE sheet_tabs ADD COLUMN IF NOT EXISTS city_name VARCHAR(100)`;

    // 3. Categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_urdu VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        is_zakat_eligible BOOLEAN DEFAULT FALSE,
        description TEXT,
        description_urdu TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. Organization Config table (singleton jsonb)
    await sql`
      CREATE TABLE IF NOT EXISTS organization_config (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 5. Shared Sheets table (stores raw grid cells and sheet metadata in Neon DB)
    await sql`
      CREATE TABLE IF NOT EXISTS shared_sheets (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        row_count INT DEFAULT 100,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 6. Users table for authentication
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure ali@markaz.com and admin@markaz.com are seeded
    await sql`
      INSERT INTO users (id, name, email, password, role)
      VALUES 
        ('usr_ali', 'Ali', 'ali@markaz.com', 'Ali@2026', 'admin'),
        ('usr_admin', 'Admin (JIM Punjab)', 'admin@markaz.com', 'Markaz@2026', 'admin')
      ON CONFLICT (email) DO NOTHING
    `;

    tablesInitialized = true;
  } catch (error) {
    console.error("Error initializing Neon database tables:", error);
  }
}
