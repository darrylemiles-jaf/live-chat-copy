import usersTable from './usersTable.js';
import chatsTable from './chatsTable.js';
import messagesTable from './messagesTable.js';
import ticketsTable from './ticketsTable.js';
import notificationsTable from './notificationsTable.js';


const tables = async (dbConnection) => {
  const queries = [
    // users
    usersTable,

    // chats
    chatsTable,

    // messages
    messagesTable,

    // tickets
    ticketsTable,

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
};

export default tables;
