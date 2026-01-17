const db = require('./config/db');

async function applySchema() {
    try {
        console.log('Applying schema updates...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS shelves (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                floor VARCHAR(50),
                block VARCHAR(50),
                capacity INT DEFAULT 0,
                status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created shelves table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created categories table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS periodicals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                issue_date DATE,
                frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
                publisher VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created periodicals table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS digital_resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                type ENUM('ebook', 'pdf', 'journal', 'video') NOT NULL,
                access_link TEXT NOT NULL,
                license VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created digital_resources table');

        // Check if columns exist before adding to avoid errors on repeated runs
        // A simple way is to use specific try-catch blocks or check information_schema
        // For simplicity in this dev environment, I'll attempt ADD COLUMN and catch 'Duplicate column name' error

        const addColumn = async (table, query) => {
            try {
                await db.query(`ALTER TABLE ${table} ADD COLUMN ${query}`);
                console.log(`Added column: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${query.split(' ')[0]}`);
                } else {
                    console.error(`Error adding column ${query}:`, err.message);
                }
            }
        };

        await addColumn('books', "format ENUM('hardcover', 'paperback', 'ebook', 'audiobook') DEFAULT 'hardcover'");
        await addColumn('books', "is_reference BOOLEAN DEFAULT FALSE");
        await addColumn('books', "reference_type VARCHAR(100)");

        console.log('Schema update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

applySchema();
