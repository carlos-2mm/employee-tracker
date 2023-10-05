// Load environment variables from .env file
require('dotenv').config();

// Import the MySQL 2 module
const mysql = require('mysql2');

// Create a new connection to the database using the environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,         // Database host
    user: process.env.DB_USER,         // Database user
    password: process.env.DB_PASSWORD, // Password for the database user
    database: process.env.DB_NAME,     // Name of the database to connect to
});

// Establish the connection to the database
db.connect((err) => {
    if (err) throw err;                // If there's an error during connection, throw it
    console.log('Connected to the database.'); // Log a success message on successful connection
});

// Export the connection object so it can be imported and used in other files
module.exports = db;
