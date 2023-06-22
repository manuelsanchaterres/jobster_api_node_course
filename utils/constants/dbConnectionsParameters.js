require('dotenv').config()

const {connect_database_store_api} = require('../../db/connections/index')

const dbConnectionsParameters = [

    {

        databaseName: "store_api",
        connectionFn:connect_database_store_api,
        connectionString: process.env.MONGODB_URI_DATABASE_STORE_API
    },

]

module.exports = dbConnectionsParameters
