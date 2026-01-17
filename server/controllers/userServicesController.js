const db = require('../config/db');

// Reading Rooms
exports.getReadingRooms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reading_rooms');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createReadingRoom = async (req, res) => {
    try {
        const { name, capacity, available_seats, timings, status } = req.body;
        await db.query('INSERT INTO reading_rooms (name, capacity, available_seats, timings, status) VALUES (?, ?, ?, ?, ?)',
            [name, capacity, available_seats, timings, status]);
        res.status(201).json({ message: 'Reading Room created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Reservations
exports.getReservations = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, b.title as book_title, m.name as member_name 
            FROM reservations r
            JOIN books b ON r.book_id = b.id
            JOIN members m ON r.member_id = m.id
            ORDER BY r.reservation_date DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createReservation = async (req, res) => {
    try {
        const { book_id, member_id, end_date } = req.body;
        await db.query('INSERT INTO reservations (book_id, member_id, expiry_date) VALUES (?, ?, ?)',
            [book_id, member_id, end_date]);
        res.status(201).json({ message: 'Reservation created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Help Desk
exports.getHelpDeskTickets = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT h.*, m.name as member_name 
            FROM help_desk_tickets h
            LEFT JOIN members m ON h.member_id = m.id
            ORDER BY h.created_at DESC
        `);
        const results = rows.map(r => ({
            ...r,
            submitted_by: r.member_name || r.contact_name || 'Anonymous'
        }));
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createHelpDeskTicket = async (req, res) => {
    try {
        const { query_type, description, member_id, contact_name } = req.body;
        await db.query('INSERT INTO help_desk_tickets (query_type, description, member_id, contact_name) VALUES (?, ?, ?, ?)',
            [query_type, description, member_id, contact_name]);
        res.status(201).json({ message: 'Ticket created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// User Activity
exports.getUserActivity = async (req, res) => {
    try {
        // Simple aggregate of members with activity
        const [rows] = await db.query(`
            SELECT m.id, m.name, m.membership_type,
            (SELECT COUNT(*) FROM transactions t WHERE t.member_id = m.id AND t.status = 'issued') as books_issued,
            (SELECT COUNT(*) FROM reservations r WHERE r.member_id = m.id AND r.status = 'reserved') as books_reserved,
            (SELECT COALESCE(SUM(fine_amount), 0) FROM transactions t WHERE t.member_id = m.id AND t.fine_amount > 0) as pending_fines
            FROM members m
            HAVING books_issued > 0 OR books_reserved > 0 OR pending_fines > 0
            LIMIT 50
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
