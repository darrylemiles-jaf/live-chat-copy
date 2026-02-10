import {
  colours,
  PROJECT_NAME
} from './constants/constants.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js';
import tables from './tables/tables.js';

/* ============================ ROUTE IMPORTS ============================ */
import usersRoutes from './routes/usersRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT
const API_VERSION = process.env.API_VERSION

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));

app.get(`/api/${API_VERSION}`, (req, res) => {
  res.send('API Gateway is running...');
});

/* ============================ ROUTES ============================ */
app.use(`/api/${API_VERSION}/users`, usersRoutes)
app.use(`/api/${API_VERSION}/messages`, messagesRoutes)

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    app.listen(PORT, () =>
      console.log(
        colours.fg.yellow,
        `${PROJECT_NAME} API is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
        colours.reset
      )
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    await tables(pool);
  } catch (error) {
    console.error('Error setting up tables:', error);
  }
};

// Invoke Start Application Function
startServer();
createTables()