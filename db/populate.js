require('dotenv').config();

const mockData = require('../mock_data.json');
const Job = require('../models/Job');

const connectDB = require('./connect')


const start = async() => {

    try {
        
        await connectDB(process.env.MONGODB_URI_DATABASE_JOBSTER_API)

        await Job.create(mockData)
        console.log('Connected to JobsApi database and mock data on database');
        process.exit(0);

    } catch (error) {
        
        console.log(error);
        process.exit(1)
    }
}

start()