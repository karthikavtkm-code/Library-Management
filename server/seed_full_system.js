const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedSystem() {
    try {
        console.log('🌱 Starting System Seeding with 10+ items per section...');

        // 1. Create Tables (Condensed for brevity, assuming structure exists from previous runs or will be created)
        // ... (Keep table creation logic same as before, essentially) ...
        await db.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role ENUM('admin', 'staff') DEFAULT 'staff', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS library_nodes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, parent_id INT, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parent_id) REFERENCES library_nodes(id) ON DELETE CASCADE)`);
        await db.query(`CREATE TABLE IF NOT EXISTS shelves (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, floor VARCHAR(50), block VARCHAR(50), capacity INT DEFAULT 0, status ENUM('available', 'full', 'maintenance') DEFAULT 'available', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS formats (id INT AUTO_INCREMENT PRIMARY KEY, format VARCHAR(100) UNIQUE NOT NULL, count INT DEFAULT 0)`);
        await db.query(`CREATE TABLE IF NOT EXISTS periodicals (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, issue_date DATE, frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL, publisher VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS digital_resources (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, type ENUM('ebook', 'pdf', 'journal', 'video') NOT NULL, access_link TEXT NOT NULL, license VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        // Books table check/create
        const [tableExists] = await db.query("SHOW TABLES LIKE 'books'");
        if (tableExists.length === 0) {
            await db.query(`CREATE TABLE books (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, author VARCHAR(255) NOT NULL, isbn VARCHAR(50) UNIQUE, category VARCHAR(100), shelf_id INT, status ENUM('available', 'issued', 'reserved', 'maintenance', 'lost') DEFAULT 'available', format ENUM('hardcover', 'paperback', 'ebook', 'audiobook') DEFAULT 'hardcover', is_reference BOOLEAN DEFAULT FALSE, reference_type VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE SET NULL)`);
        } else {
            try { await db.query("ALTER TABLE books ADD COLUMN format ENUM('hardcover', 'paperback', 'ebook', 'audiobook') DEFAULT 'hardcover'"); } catch (e) { }
            try { await db.query("ALTER TABLE books ADD COLUMN is_reference BOOLEAN DEFAULT FALSE"); } catch (e) { }
            try { await db.query("ALTER TABLE books ADD COLUMN reference_type VARCHAR(100)"); } catch (e) { }
        }

        await db.query(`CREATE TABLE IF NOT EXISTS members (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(20), address TEXT, membership_type ENUM('student', 'faculty', 'public') DEFAULT 'public', membership_date DATE DEFAULT (CURRENT_DATE), status ENUM('active', 'inactive', 'suspended') DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);

        await db.query('DROP TABLE IF EXISTS transactions');
        await db.query(`CREATE TABLE IF NOT EXISTS transactions (id INT AUTO_INCREMENT PRIMARY KEY, book_id INT NOT NULL, member_id INT NOT NULL, issue_date DATE NOT NULL, due_date DATE NOT NULL, return_date DATE, fine_amount DECIMAL(10, 2) DEFAULT 0.00, status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued', issued_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE, FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL)`);

        await db.query(`CREATE TABLE IF NOT EXISTS reading_rooms (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, capacity INT DEFAULT 0, available_seats INT DEFAULT 0, timings VARCHAR(100), status ENUM('open', 'full', 'closed', 'maintenance') DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`CREATE TABLE IF NOT EXISTS reservations (id INT AUTO_INCREMENT PRIMARY KEY, book_id INT NOT NULL, member_id INT NOT NULL, reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP, expiry_date DATETIME, status ENUM('reserved', 'collected', 'cancelled', 'expired') DEFAULT 'reserved', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE)`);
        await db.query(`CREATE TABLE IF NOT EXISTS help_desk_tickets (id INT AUTO_INCREMENT PRIMARY KEY, member_id INT, query_type ENUM('book_search', 'membership', 'fine', 'general', 'technical', 'fine_dispute', 'lost_book') DEFAULT 'general', description TEXT, contact_name VARCHAR(255), status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL)`);


        // 2. Seed Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        await db.query(`INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin') ON DUPLICATE KEY UPDATE role='admin'`, [hashedPassword]);

        // 3. Clear existing library hierarchical structure
        await db.query('DELETE FROM library_nodes');

        // 4. Seed Library Structure
        const [resSec] = await db.query("INSERT INTO library_nodes (name, type) VALUES ('Sections', 'Section')");
        const sectionsId = resSec.insertId;
        const [resOps] = await db.query("INSERT INTO library_nodes (name, type) VALUES ('Library Operations', 'Library Operations')");
        const opsId = resOps.insertId;
        const [resSvc] = await db.query("INSERT INTO library_nodes (name, type) VALUES ('User Services', 'User Services')");
        const svcId = resSvc.insertId;

        await db.query(`INSERT INTO library_nodes (name, type, parent_id) VALUES 
            ('Shelf', 'Shelf', ?), ('Reference Unit', 'Reference Unit', ?), ('Periodicals', 'Periodicals Unit', ?), ('Digital Resources', 'Digital Resources', ?)`, [sectionsId, sectionsId, sectionsId, sectionsId]);
        await db.query(`INSERT INTO library_nodes (name, type, parent_id) VALUES 
            ('Issue & Return', 'Issue & Return Desk', ?), ('Membership Management', 'Membership Management', ?), ('Fine Management', 'Fine Management', ?), ('Inventory Control', 'Inventory Control', ?)`, [opsId, opsId, opsId, opsId]);
        await db.query(`INSERT INTO library_nodes (name, type, parent_id) VALUES 
            ('Reading Room', 'Reading Rooms', ?), ('Reservation System', 'Reservation System', ?), ('Help Desk', 'Help Desk', ?)`, [svcId, svcId, svcId]);


        // 5. Seed Content Tables with 10+ items each
        console.log('Seeding Massive Content Data...');

        // --- Shelves (10 items) ---
        await db.query('DELETE FROM shelves');
        const r_shelves = [];
        for (let i = 1; i <= 10; i++) {
            r_shelves.push(`('S-${100 + i}', 'Shelf Block ${String.fromCharCode(64 + i)}', 'Floor ${i % 3 + 1}', 'Wing ${i % 2 === 0 ? 'A' : 'B'}', 100, 'available')`);
        }
        await db.query(`INSERT INTO shelves (code, name, floor, block, capacity, status) VALUES ${r_shelves.join(',')}`);

        // --- Categories (10 items) ---
        await db.query('DELETE FROM categories');
        await db.query(`INSERT INTO categories (name, description) VALUES 
            ('Fiction', 'Imaginative narration'), 
            ('Science', 'Study of structure and behavior'),
            ('History', 'Study of past events'),
            ('Reference', 'Encyclopedias and Dictionaries'),
            ('Technology', 'Engineering and Tech'),
            ('Philosophy', 'Study of fundamental questions'),
            ('Arts', 'Creative arts and culture'),
            ('Biography', 'Life stories'),
            ('Religion', 'Belief systems'),
            ('Psychology', 'Study of mind and behavior')
        `);

        // --- Members (10 items) ---
        await db.query('DELETE FROM members');
        const r_members = [
            `('John Doe', 'john@uni.edu', '555-0101', 'student', 'active')`,
            `('Jane Smith', 'jane@uni.edu', '555-0102', 'faculty', 'active')`,
            `('Alice Johnson', 'alice@uni.edu', '555-0103', 'student', 'active')`,
            `('Bob Brown', 'bob@uni.edu', '555-0104', 'public', 'active')`,
            `('Charlie Davis', 'charlie@uni.edu', '555-0105', 'student', 'suspended')`,
            `('Diana Evans', 'diana@uni.edu', '555-0106', 'faculty', 'active')`,
            `('Ethan Wilson', 'ethan@uni.edu', '555-0107', 'student', 'inactive')`,
            `('Fiona Clark', 'fiona@uni.edu', '555-0108', 'public', 'active')`,
            `('George Hall', 'george@uni.edu', '555-0109', 'faculty', 'active')`,
            `('Hannah Lewis', 'hannah@uni.edu', '555-0110', 'student', 'active')`
        ];
        await db.query(`INSERT INTO members (name, email, phone, membership_type, status) VALUES ${r_members.join(',')}`);
        const [members] = await db.query("SELECT id FROM members");

        // --- Get Shelf IDs for Books ---
        const [shelfRows] = await db.query("SELECT id FROM shelves");
        const sIds = shelfRows.map(s => s.id);

        // --- Books (Inv Control + Reference) (20 items) ---
        await db.query('DELETE FROM books');
        const booksData = [
            // Normal Books
            `('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', ${sIds[0]}, 'available', 'hardcover', 0, NULL)`,
            `('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', ${sIds[1]}, 'available', 'paperback', 0, NULL)`,
            `('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', ${sIds[2]}, 'issued', 'ebook', 0, NULL)`,
            `('1984', 'George Orwell', '9780451524935', 'Fiction', ${sIds[0]}, 'available', 'paperback', 0, NULL)`,
            `('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', ${sIds[3]}, 'available', 'hardcover', 0, NULL)`,
            `('The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Technology', ${sIds[2]}, 'available', 'hardcover', 0, NULL)`,
            `('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', ${sIds[0]}, 'issued', 'paperback', 0, NULL)`,
            `('Thinking, Fast and Slow', 'Daniel Kahneman', '9780374275631', 'Psychology', ${sIds[4]}, 'available', 'hardcover', 0, NULL)`,
            `('Dune', 'Frank Herbert', '9780441172719', 'Fiction', ${sIds[0]}, 'available', 'paperback', 0, NULL)`,
            `('Cosmos', 'Carl Sagan', '9780345331359', 'Science', ${sIds[1]}, 'maintenance', 'paperback', 0, NULL)`,

            // Reference Books
            `('Oxford English Dictionary', 'Oxford', '9780198611868', 'Reference', ${sIds[5]}, 'available', 'hardcover', 1, 'Dictionary')`,
            `('Encyclopedia Britannica Vol 1', 'Britannica', '9781593392925', 'Reference', ${sIds[5]}, 'available', 'hardcover', 1, 'Encyclopedia')`,
            `('World Atlas 2024', 'Rand McNally', '9780528026197', 'Reference', ${sIds[6]}, 'available', 'hardcover', 1, 'Atlas')`,
            `('Merriam-Webster Collegiate', 'Merriam-Webster', '9780877798095', 'Reference', ${sIds[5]}, 'available', 'hardcover', 1, 'Dictionary')`,
            `('The Merck Manual', 'Robert Porter', '9780911910193', 'Reference', ${sIds[6]}, 'available', 'hardcover', 1, 'Manual')`,
            `('Guinness World Records 2025', 'Guinness', '9781913484217', 'Reference', ${sIds[5]}, 'available', 'hardcover', 1, 'Almanac')`,
            `('Rogets Thesaurus', 'Roget', '9780062720375', 'Reference', ${sIds[5]}, 'available', 'paperback', 1, 'Dictionary')`,
            `('Gray’s Anatomy', 'Henry Gray', '9780785800445', 'Science', ${sIds[6]}, 'available', 'hardcover', 1, 'Encyclopedia')`,
            `('Dorlands Medical Dictionary', 'Dorland', '9781416062578', 'Reference', ${sIds[6]}, 'available', 'hardcover', 1, 'Dictionary')`,
            `('Historical Atlas of the World', 'Rand McNally', '9780528839690', 'History', ${sIds[6]}, 'available', 'paperback', 1, 'Atlas')`
        ];
        await db.query(`INSERT INTO books (title, author, isbn, category, shelf_id, status, format, is_reference, reference_type) VALUES ${booksData.join(',')}`);
        const [books] = await db.query("SELECT id FROM books");

        // --- Periodicals (10 items) ---
        await db.query('DELETE FROM periodicals');
        await db.query(`INSERT INTO periodicals (name, issue_date, frequency, publisher) VALUES 
            ('Nature', '2025-01-01', 'weekly', 'Nature Portfolio'),
            ('National Geographic', '2025-01-01', 'monthly', 'Disney'),
            ('Time Magazine', '2025-01-05', 'weekly', 'Time USA'),
            ('The Economist', '2025-01-06', 'weekly', 'Economist Group'),
            ('Scientific American', '2025-01-01', 'monthly', 'Springer Nature'),
            ('Forbes', '2025-01-15', 'monthly', 'Forbes Media'),
            ('Vogue', '2025-01-01', 'monthly', 'Condé Nast'),
            ('Wired', '2025-01-01', 'monthly', 'Condé Nast'),
            ('Harvard Business Review', '2025-01-01', 'monthly', 'Harvard'),
            ('New Scientist', '2025-01-08', 'weekly', 'Daily Mail Group')
        `);

        // --- Digital Resources (10 items) ---
        await db.query('DELETE FROM digital_resources');
        await db.query(`INSERT INTO digital_resources (title, type, access_link, license) VALUES 
            ('IEEE Xplore', 'database', 'https://ieeexplore.ieee.org', 'Institutional'),
            ('ProQuest Ebook Central', 'ebook', 'https://ebookcentral.proquest.com', 'Standard'),
            ('JSTOR Archive', 'journal', 'https://www.jstor.org', 'Institutional'),
            ('ScienceDirect', 'database', 'https://www.sciencedirect.com', 'Premium'),
            ('Oxford Art Online', 'database', 'https://www.oxfordartonline.com', 'Standard'),
            ('Kanopy Streaming', 'video', 'https://www.kanopy.com', 'Institutional'),
            ('Project MUSE', 'journal', 'https://muse.jhu.edu', 'Standard'),
            ('ACM Digital Library', 'database', 'https://dl.acm.org', 'Institutional'),
            ('Cambridge Core', 'ebook', 'https://www.cambridge.org/core', 'Standard'),
            ('O’Reilly Learning', 'ebook', 'https://www.oreilly.com', 'Premium')
        `);

        // --- Reading Rooms (10 items) ---
        await db.query('DELETE FROM reading_rooms');
        await db.query(`INSERT INTO reading_rooms (name, capacity, available_seats, timings, status) VALUES 
            ('Main Hall A', 50, 42, '8AM - 10PM', 'open'),
            ('Main Hall B', 50, 10, '8AM - 10PM', 'open'),
            ('Quiet Zone 1', 20, 5, '24 Hours', 'open'),
            ('Quiet Zone 2', 20, 20, '24 Hours', 'open'),
            ('Group Study Room 1', 6, 0, '9AM - 8PM', 'full'),
            ('Group Study Room 2', 6, 6, '9AM - 8PM', 'open'),
            ('Group Study Room 3', 8, 2, '9AM - 8PM', 'open'),
            ('Media Lab', 15, 8, '10AM - 6PM', 'open'),
            ('Research Carrels', 10, 0, '8AM - 10PM', 'maintenance'),
            ('Faculty Lounge', 12, 11, '8AM - 8PM', 'open')
        `);

        // --- Help Desk (10 items) ---
        await db.query('DELETE FROM help_desk_tickets');
        const hd_values = [];
        for (let i = 0; i < 10; i++) {
            hd_values.push(`(${members[i % members.length].id}, '${i % 2 == 0 ? 'book_search' : 'general'}', 'Sample query description ${i + 1}', '${i % 3 == 0 ? 'resolved' : 'open'}')`);
        }
        await db.query(`INSERT INTO help_desk_tickets (member_id, query_type, description, status) VALUES ${hd_values.join(',')}`);

        // --- Transactions (Issue/Return/Fine) (10+ items) ---
        await db.query('DELETE FROM transactions');
        const t_values = [];
        // 4 Issued (Active)
        t_values.push(`(${books[0].id}, ${members[0].id}, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), NULL, 0.00, 'issued')`);
        t_values.push(`(${books[1].id}, ${members[1].id}, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 0.00, 'issued')`);
        t_values.push(`(${books[2].id}, ${members[2].id}, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), NULL, 0.00, 'issued')`);
        t_values.push(`(${books[3].id}, ${members[3].id}, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), NULL, 0.00, 'issued')`);

        // 3 Overdue (Fine)
        t_values.push(`(${books[4].id}, ${members[4].id}, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), NULL, 16.00, 'overdue')`);
        t_values.push(`(${books[5].id}, ${members[5].id}, DATE_SUB(CURDATE(), INTERVAL 40 DAY), DATE_SUB(CURDATE(), INTERVAL 26 DAY), NULL, 26.00, 'overdue')`);
        t_values.push(`(${books[6].id}, ${members[6].id}, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), NULL, 6.00, 'overdue')`);

        // 3 Returned
        t_values.push(`(${books[7].id}, ${members[7].id}, '2024-12-01', '2024-12-15', '2024-12-10', 0.00, 'returned')`);
        t_values.push(`(${books[8].id}, ${members[8].id}, '2024-12-05', '2024-12-19', '2024-12-18', 0.00, 'returned')`);
        t_values.push(`(${books[9].id}, ${members[9].id}, '2024-11-01', '2024-11-15', '2024-11-14', 0.00, 'returned')`);

        await db.query(`INSERT INTO transactions (book_id, member_id, issue_date, due_date, return_date, fine_amount, status) VALUES ${t_values.join(',')}`);

        // --- Reservations (10 items) ---
        await db.query('DELETE FROM reservations');
        const res_values = [];
        for (let i = 0; i < 10; i++) {
            res_values.push(`(${books[10 + i].id}, ${members[i % members.length].id}, DATE_SUB(NOW(), INTERVAL ${i} DAY), 'reserved')`);
        }
        await db.query(`INSERT INTO reservations (book_id, member_id, reservation_date, status) VALUES ${res_values.join(',')}`);

        console.log('✅ HUGE Success! Database populated with 10+ items per section.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}

seedSystem();
