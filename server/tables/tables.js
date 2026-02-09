// users
import usersTable from './usersTable.js';
const tables = async (dbConnection) => {
  const queries = [
    // users
    usersTable,
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
