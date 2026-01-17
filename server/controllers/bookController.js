const db = require('../config/db');

exports.getAllBooks = async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books ORDER BY created_at DESC');
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addBook = async (req, res) => {
    try {
        const { title, author, isbn, category, shelf_id, format, is_reference, reference_type, status } = req.body;

        const [result] = await db.query(
            'INSERT INTO books (title, author, isbn, category, shelf_id, format, is_reference, reference_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                title,
                author,
                isbn,
                category || null,
                shelf_id || null,
                format || 'hardcover',
                is_reference ? 1 : 0,
                reference_type || null,
                status || 'available'
            ]
        );
        res.status(201).json({ id: result.insertId, title, ...req.body });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'ISBN already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, category, shelf_id, status, format, is_reference, reference_type } = req.body;

        await db.query(
            `UPDATE books SET 
                title = ?, 
                author = ?, 
                isbn = ?, 
                category = ?, 
                shelf_id = ?, 
                status = ?,
                format = ?,
                is_reference = ?,
                reference_type = ?
            WHERE id = ?`,
            [
                title,
                author,
                isbn,
                category || null,
                shelf_id || null,
                status,
                format || 'hardcover',
                is_reference ? 1 : 0,
                reference_type || null,
                id
            ]
        );
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM books WHERE id = ?', [id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.searchItems = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const searchQuery = `%${query}%`;

        // Search in Books (Shelf and Reference)
        const [books] = await db.query(`
            SELECT id, title, author as subtitle, 
            CASE WHEN is_reference = 1 THEN 'Reference Unit' ELSE 'Shelf' END as location,
            'Book' as type
            FROM books 
            WHERE title LIKE ? OR author LIKE ?
        `, [searchQuery, searchQuery]);

        // Search in Periodicals
        const [periodicals] = await db.query(`
            SELECT id, name as title, publisher as subtitle, 'Periodicals Unit' as location, 'Periodical' as type
            FROM periodicals 
            WHERE name LIKE ? OR publisher LIKE ?
        `, [searchQuery, searchQuery]);

        // Search in Digital Resources
        const [digital] = await db.query(`
            SELECT id, title, type as subtitle, 'Digital Resources' as location, 'Digital' as type
            FROM digital_resources 
            WHERE title LIKE ?
        `, [searchQuery]);

        const results = [...books, ...periodicals, ...digital].slice(0, 10);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
