import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FATAL: DATABASE_URL is not set in environment.");
}

export const sql = neon(connectionString);

/**
 * Initializes database tables if they do not exist
 */
export async function initDatabase() {
  try {
    console.log("Checking and initializing Neon PostgreSQL tables...");

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

    // 2. Sheet Tabs table
    await sql`
      CREATE TABLE IF NOT EXISTS sheet_tabs (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_urdu VARCHAR(255),
        category_filter VARCHAR(100),
        type_filter VARCHAR(50),
        color VARCHAR(50),
        period_type VARCHAR(50),
        period_value VARCHAR(100),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

    console.log("Neon PostgreSQL tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing Neon database tables:", error);
    throw error;
  }
}
