import usersTable from './usersTable.js';
import chatsTable from './chatsTable.js';
import messagesTable, { messagesTableMigration } from './messagesTable.js';
import notificationsTable, { notificationsTableMigration } from './notificationsTable.js';

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

  // Run migrations for existing tables (add new columns)
  const migrations = [
    messagesTableMigration,
    notificationsTableMigration
  ];

  for (const migration of migrations) {
    try {
      await dbConnection.query(migration);
    } catch (error) {
      if (!error.message.includes('Duplicate column')) {
        console.log('Migration note:', error.message);
      }
    }
  }

};

export default tables;

