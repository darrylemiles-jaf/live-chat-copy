# Database Migrations

This folder contains SQL migration scripts for database schema changes.

## How to Run Migrations

### Option 1: Using MySQL CLI
```bash
mysql -u your_username -p your_database_name < migrations/add_profile_picture_column.sql
```

### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open your database management tool
2. Select your database
3. Open the SQL file and execute it

### Option 3: Using Node.js (if you have mysql2 installed)
```javascript
import pool from './config/db.js';
import fs from 'fs';

const runMigration = async (filename) => {
  const sql = fs.readFileSync(`./migrations/${filename}`, 'utf8');
  await pool.query(sql);
  console.log(`Migration ${filename} completed successfully`);
};

// Run migration
runMigration('add_profile_picture_column.sql');
```

## Available Migrations

- `add_profile_picture_column.sql` - Adds profile_picture column to users table

## Important Notes

- Always backup your database before running migrations
- Migrations should be idempotent (safe to run multiple times)
- Test migrations in development environment first
