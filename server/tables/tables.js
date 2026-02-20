import usersTable from './usersTable.js';
import chatsTable from './chatsTable.js';
import messagesTable from './messagesTable.js';
import notificationsTable from './notificationsTable.js';

const tables = async (dbConnection) => {
  const queries = [
    // users
    usersTable,

    // chats
    chatsTable,

    // messages
    messagesTable,

    // notifications
    notificationsTable
  ];

  for (const query of queries) {
    try {
      await dbConnection.query(query);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }

  // ── Migrations ──────────────────────────────────────────────
  // Add 'bot' to sender_role ENUM (safe to run repeatedly)
  try {
    await dbConnection.query(`
      ALTER TABLE messages
        MODIFY COLUMN sender_role ENUM('client','support','admin','bot') NOT NULL
    `);
  } catch (err) {
    // Ignore if already applied
  }

  // Ensure system bot user exists (used for auto-reply messages)
  try {
    await dbConnection.query(`
      INSERT IGNORE INTO users (name, username, password, email, role, status)
      VALUES ('Support Bot', 'system_bot', 'SYSTEM_NO_LOGIN', 'system@bot.internal', 'support', 'available')
    `);
  } catch (err) {
    // Ignore if already present
  }
};

export default tables;

