import pool from "../config/db.js";

const addProfilePictureColumn = async () => {
  try {
    console.log("Adding profile_picture column to users table...");
    
    // Check if column already exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profile_picture'
    `);
    
    if (columns.length > 0) {
      console.log("✓ Column 'profile_picture' already exists.");
      return;
    }
    
    // Add the column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL 
      AFTER phone
    `);
    
    console.log("✓ Successfully added 'profile_picture' column to users table.");
    
  } catch (error) {
    console.error("✗ Error adding column:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run the migration
addProfilePictureColumn()
  .then(() => {
    console.log("\n✓ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Migration failed:", error.message);
    process.exit(1);
  });
