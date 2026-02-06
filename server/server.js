import {
  colours,
  PROJECT_NAME
} from './constants/constants.js';

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

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

const startServer = async () => {
  try {
    app.listen(PORT, () =>
      console.log(
        colours.fg.yellow,
        `${PROJECT_NAME} API is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
        colours.reset
      )
    );

    await connectDB();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Invoke Start Application Function
startServer();