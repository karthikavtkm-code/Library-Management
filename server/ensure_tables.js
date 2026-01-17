const db = require('./config/db');

async function ensureTables() {
    try {
        console.log('Ensuring all tables exist...');

        // 1. Core tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'staff') DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                membership_type ENUM('student', 'faculty', 'public') DEFAULT 'public',
                membership_date DATE DEFAULT (CURRENT_DATE),
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

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

        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Books depends on shelves
        await db.query(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(50) UNIQUE,
                category VARCHAR(100),
                shelf_id INT,
                status ENUM('available', 'issued', 'reserved', 'maintenance') DEFAULT 'available',
                format ENUM('hardcover', 'paperback', 'ebook', 'audiobook') DEFAULT 'hardcover',
                is_reference BOOLEAN DEFAULT FALSE,
                reference_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE SET NULL
            )
        `);

        // Periodicals
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

        // Digital Resources
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

        // Transactions (depends on books, members, users)
        await db.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                book_id INT NOT NULL,
                member_id INT NOT NULL,
                issue_date DATE NOT NULL,
                due_date DATE NOT NULL,
                return_date DATE,
                fine_amount DECIMAL(10, 2) DEFAULT 0.00,
                status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
                issued_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
                FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // 2. User Services Tables

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

        console.log('All tables verified/created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error ensuring tables:', error);
        process.exit(1);
    }
}

ensureTables();
