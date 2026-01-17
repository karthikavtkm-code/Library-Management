const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });
        console.log('Successfully connected to the database.');
        const [rows] = await connection.execute('SELECT 1');
        console.log('Query successful:', rows);
        await connection.end();
    } catch (error) {
        console.error('Database connection failed:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
    }
}

checkDB();
