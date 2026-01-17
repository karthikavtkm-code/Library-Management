const db = require('../config/db');

// Shelves
exports.getShelves = async (req, res) => {
    try {
        // Include book count per shelf
        const [rows] = await db.query(`
            SELECT s.*, COUNT(b.id) as current_count 
            FROM shelves s 
            LEFT JOIN books b ON b.shelf_id = s.id 
            GROUP BY s.id 
            ORDER BY s.code
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createShelf = async (req, res) => {
    try {
        const { code, name, floor, block, capacity, status } = req.body;
        await db.query('INSERT INTO shelves (code, name, floor, block, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [code, name, floor, block, capacity, status]);
        res.status(201).json({ message: 'Shelf created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateShelf = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, floor, block, capacity, status } = req.body;
        await db.query('UPDATE shelves SET code=?, name=?, floor=?, block=?, capacity=?, status=? WHERE id=?',
            [code, name, floor, block, capacity, status, id]);
        res.json({ message: 'Shelf updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteShelf = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM shelves WHERE id = ?', [id]);
        res.json({ message: 'Shelf deleted' });
    } catch (err) {
        // Check for foreign constraint violations (books on shelf)
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'Cannot delete shelf containing books. Move books first.' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.getShelfBooks = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT b.*, c.name as category_name
            FROM books b 
            LEFT JOIN categories c ON b.category = c.name
            WHERE b.shelf_id = ?
            ORDER BY b.title
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Categories
exports.getCategories = async (req, res) => {
    try {
        // Count books per category
        const [rows] = await db.query(`
            SELECT c.*, COUNT(b.id) as total_books 
            FROM categories c 
            LEFT JOIN books b ON b.category = c.name 
            GROUP BY c.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ message: 'Category created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Periodicals
exports.getPeriodicals = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM periodicals ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPeriodical = async (req, res) => {
    try {
        const { name, issue_date, frequency, publisher } = req.body;
        await db.query('INSERT INTO periodicals (name, issue_date, frequency, publisher) VALUES (?, ?, ?, ?)',
            [name, issue_date, frequency, publisher]);
        res.status(201).json({ message: 'Periodical created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Digital Resources
exports.getDigitalResources = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM digital_resources ORDER BY title');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDigitalResource = async (req, res) => {
    try {
        const { title, type, access_link, license } = req.body;
        await db.query('INSERT INTO digital_resources (title, type, access_link, license) VALUES (?, ?, ?, ?)',
            [title, type, access_link, license]);
        res.status(201).json({ message: 'Digital Resource created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDigitalResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, access_link, license } = req.body;
        await db.query('UPDATE digital_resources SET title=?, type=?, access_link=?, license=? WHERE id=?',
            [title, type, access_link, license, id]);
        res.json({ message: 'Digital Resource updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDigitalResource = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM digital_resources WHERE id = ?', [id]);
        res.json({ message: 'Digital Resource deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Formats (derived from books)
exports.getBookFormats = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT format, COUNT(*) as count 
            FROM books 
            GROUP BY format
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
