const db = require('../config/db');

// Get all members
exports.getAllMembers = async (req, res) => {
    try {
        const [members] = await db.query('SELECT * FROM members ORDER BY created_at DESC');
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a new member
exports.addMember = async (req, res) => {
    try {
        const { name, email, phone, membership_type, address } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        const [result] = await db.query(
            'INSERT INTO members (name, email, phone, membership_type, address, status) VALUES (?, ?, ?, ?, ?, "active")',
            [name, email, phone, membership_type || 'public', address]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            phone,
            membership_type,
            address,
            status: 'active'
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a member
exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, membership_type, address, status } = req.body;

        await db.query(`
            UPDATE members 
            SET name = ?, email = ?, phone = ?, membership_type = ?, address = ?, status = ? 
            WHERE id = ?
        `, [name, email, phone, membership_type, address, status, id]);

        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a member
exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM members WHERE id = ?', [id]);
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting member' });
    }
};

// Get member history
exports.getMemberHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Auto-update overdue
        await db.query(`
            UPDATE transactions 
            SET status = 'overdue' 
            WHERE member_id = ? AND status = 'issued' AND due_date < CURDATE()
        `, [id]);

        const [history] = await db.query(`
            SELECT t.*, b.title as book_title 
            FROM transactions t 
            JOIN books b ON t.book_id = b.id 
            WHERE t.member_id = ?
            ORDER BY t.issue_date DESC
        `, [id]);

        // Calculate fines
        const [fineResult] = await db.query(`
            SELECT SUM(DATEDIFF(IFNULL(return_date, CURDATE()), due_date)) as total_overdue_days
            FROM transactions
            WHERE member_id = ? AND (return_date > due_date OR (return_date IS NULL AND due_date < CURDATE()))
        `, [id]);

        const overdueDays = fineResult[0].total_overdue_days || 0;
        const totalFine = overdueDays > 0 ? overdueDays * 1.00 : 0.00;

        res.json({
            history,
            totalFine
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
