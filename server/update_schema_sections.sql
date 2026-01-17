USE library_system;

CREATE TABLE IF NOT EXISTS shelves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    floor VARCHAR(50),
    block VARCHAR(50),
    capacity INT DEFAULT 0,
    status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS periodicals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issue_date DATE,
    frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    publisher VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS digital_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('ebook', 'pdf', 'journal', 'video') NOT NULL,
    access_link TEXT NOT NULL,
    license VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update books table to support new requirements
-- We add 'format' and 'is_reference' to support 'Book Formats' and 'Reference Unit'
ALTER TABLE books ADD COLUMN format ENUM('hardcover', 'paperback', 'ebook', 'audiobook') DEFAULT 'hardcover';
ALTER TABLE books ADD COLUMN is_reference BOOLEAN DEFAULT FALSE;
ALTER TABLE books ADD COLUMN reference_type VARCHAR(100); -- for Reference Unit types (Dictionary, etc)

SELECT 'Sections tables created successfully' as Status;
