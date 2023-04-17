const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});

module.exports = {
  server: {
    environment: process.env.environment,
    port: +process.env.PORT
  },
  database: {
    uri: process.env.mongoose_url,
    database_name: process.env.database_name
  }
}
