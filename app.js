require('dotenv').config();
require('express-async-errors');

const path = require('path')

// extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors')
const express = require('express');
const app = express();

// only if we deploy to heroku

// app.set('trust proxy', 1)

const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');
// routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// dev branch only comment
app.use(express.json());
app.use(helmet());
app.use(cors())
app.use(xss());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

// serve index.html

app.get('*', (req,res) => {


  res.sendFile(path.resolve(__dirname,'./client/build', 'index.html'))

})
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.LOCAL_SERVER_HTTP_PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI_DATABASE_JOBSTER_API );

    console.log('Connect to JobsterApi database');
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
