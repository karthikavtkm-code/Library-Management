const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL...');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('Database:', process.env.DB_NAME);

        // First connect without database to create it
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✅ Database '${process.env.DB_NAME}' ready`);

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(schema);
        console.log('✅ Database schema created successfully');
        console.log('✅ All tables created (users, library_nodes, books, members, transactions)');
        console.log('✅ Admin user seeded (username: admin, password: password123)');
        console.log('\n🎉 Database setup complete! You can now start the server.');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.error('\n📋 Troubleshooting steps:');
        console.error('1. Make sure MySQL is running (check with: Get-Service MySQL80)');
        console.error('2. Verify your MySQL root password in the .env file');
        console.error('3. If you have a MySQL password, update DB_PASSWORD in .env');
        console.error('4. Try running: mysql -u root -p');
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();

