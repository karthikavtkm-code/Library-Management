const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Password:', process.env.DB_PASSWORD ? '***SET***' : '***EMPTY***');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Connected to MySQL successfully!');

        // Check if database exists
        const [databases] = await connection.query('SHOW DATABASES');
        console.log('\nAvailable databases:');
        databases.forEach(db => console.log(' -', db.Database));

        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('\nPossible solutions:');
        console.error('1. Check if MySQL is running');
        console.error('2. Verify DB_USER and DB_PASSWORD in .env file');
        console.error('3. Make sure MySQL is listening on localhost:3306');
    }
}

testConnection();
