import {
  colours,
  PROJECT_NAME
} from './constants/constants.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js';
import tables from './tables/tables.js';
import { initializeSocket } from './socket/socketHandler.js';

/* ============================ ROUTE IMPORTS ============================ */
import usersRoutes from './routes/usersRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import chatsRoutes from './routes/chatsRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import ratingsRoutes from './routes/ratingsRoutes.js';

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
app.use(`/api/${API_VERSION}/chats`, chatsRoutes)
app.use(`/api/${API_VERSION}/queue`, queueRoutes)
app.use(`/api/${API_VERSION}/notifications`, notificationsRoutes)
app.use(`/api/${API_VERSION}/ratings`, ratingsRoutes)

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);
    console.log(colours.fg.green, '✅ Socket.io initialized', colours.reset);

    httpServer.listen(PORT, () =>
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