import usersTable from './usersTable.js';
import chatsTable from './chatsTable.js';
import messagesTaable from './messagesTaable.js';


const tables = async (dbConnection) => {
  const queries = [
    // users
    usersTable,

    // chats
    chatsTable,

    // messages
    messagesTaable,
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
