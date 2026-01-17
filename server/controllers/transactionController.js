const db = require('../config/db');

exports.issueBook = async (req, res) => {
    try {
        const { book_id, member_id, due_date } = req.body;

        // Start transaction
        await db.query('START TRANSACTION');

        // Check if book is available
        const [books] = await db.query('SELECT status FROM books WHERE id = ? FOR UPDATE', [book_id]);
        if (books.length === 0 || books[0].status !== 'available') {
            await db.query('ROLLBACK');
            return res.status(400).json({ message: 'Book is not available' });
        }

        // Create transaction
        await db.query(
            'INSERT INTO transactions (book_id, member_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, "issued")',
            [book_id, member_id, due_date]
        );

        // Update book status
        await db.query('UPDATE books SET status = "issued" WHERE id = ?', [book_id]);

        await db.query('COMMIT');
        res.status(201).json({ message: 'Book issued successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.returnBook = async (req, res) => {
    try {
        const { transaction_id } = req.body;

        await db.query('START TRANSACTION');

        const [transactions] = await db.query('SELECT book_id FROM transactions WHERE id = ? FOR UPDATE', [transaction_id]);
        if (transactions.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const book_id = transactions[0].book_id;

        // Update transaction
        await db.query(
            'UPDATE transactions SET return_date = NOW(), status = "returned" WHERE id = ?',
            [transaction_id]
        );

        // Update book status
        await db.query('UPDATE books SET status = "available" WHERE id = ?', [book_id]);

        await db.query('COMMIT');
        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT t.*, b.title as book_title, m.name as member_name 
            FROM transactions t 
            LEFT JOIN books b ON t.book_id = b.id 
            LEFT JOIN members m ON t.member_id = m.id
            ORDER BY t.issue_date DESC
        `);
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
