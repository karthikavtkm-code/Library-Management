const db = require('./config/db');

async function applySchema() {
    try {
        console.log('Applying User Services schema updates...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS reading_rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                capacity INT DEFAULT 0,
                available_seats INT DEFAULT 0,
                timings VARCHAR(100),
                status ENUM('open', 'full', 'closed', 'maintenance') DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created reading_rooms table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                book_id INT NOT NULL,
                member_id INT NOT NULL,
                reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                expiry_date DATETIME,
                status ENUM('reserved', 'collected', 'cancelled', 'expired') DEFAULT 'reserved',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
            )
        `);
        console.log('Created reservations table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS help_desk_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                query_type ENUM('book_search', 'membership', 'fine', 'general', 'technical') DEFAULT 'general',
                description TEXT,
                contact_name VARCHAR(255),
                status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
            )
        `);
        console.log('Created help_desk_tickets table');

        console.log('User Services schema update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

applySchema();
