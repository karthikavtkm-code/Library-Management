const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // Update overdue status for active transactions
        await db.query(`
            UPDATE transactions 
            SET status = 'overdue' 
            WHERE status = 'active' AND due_date < NOW()
        `);

        // Counts for KPI
        const [[{ count: bookCount }]] = await db.query('SELECT COUNT(*) as count FROM books');
        const [[{ count: memberCount }]] = await db.query('SELECT COUNT(*) as count FROM members');
        const [[{ count: issuedCount }]] = await db.query('SELECT COUNT(*) as count FROM books WHERE status = "issued"');
        const [[{ count: overdueCount }]] = await db.query('SELECT COUNT(*) as count FROM transactions WHERE status = "overdue"');
        const [[{ count: issuedToday }]] = await db.query('SELECT COUNT(*) as count FROM transactions WHERE DATE(issue_date) = CURDATE()');

        // Distribution Stats
        const [[{ count: shelfCount }]] = await db.query('SELECT COUNT(*) as count FROM books WHERE is_reference = 0');
        const [[{ count: refCount }]] = await db.query('SELECT COUNT(*) as count FROM books WHERE is_reference = 1');
        const [[{ count: periodicalCount }]] = await db.query('SELECT COUNT(*) as count FROM periodicals');
        const [[{ count: digitalCount }]] = await db.query('SELECT COUNT(*) as count FROM digital_resources');

        // Library Operations Summary
        const [[{ count: totalTransactions }]] = await db.query('SELECT COUNT(*) as count FROM transactions');
        const [[{ sum: totalFines }]] = await db.query('SELECT SUM(fine_amount) as sum FROM transactions');

        // User Services Summary
        const [[{ sum: availableSeats }]] = await db.query('SELECT SUM(available_seats) as sum FROM reading_rooms');
        const [[{ count: activeReservations }]] = await db.query('SELECT COUNT(*) as count FROM reservations WHERE status = "reserved"');
        const [[{ count: openTickets }]] = await db.query('SELECT COUNT(*) as count FROM help_desk_tickets WHERE status = "open"');

        // Recent books
        const [recentBooks] = await db.query(`
            SELECT title, author, is_reference FROM books ORDER BY created_at DESC LIMIT 5
        `);

        // Recent transactions
        const [recentTransactions] = await db.query(`
            SELECT t.*, b.title as book_title, m.name as member_name 
            FROM transactions t 
            JOIN books b ON t.book_id = b.id 
            JOIN members m ON t.member_id = m.id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        res.json({
            stats: {
                totalBooks: bookCount + periodicalCount + digitalCount,
                activeMembers: memberCount,
                issuedBooks: issuedCount,
                issuedToday: issuedToday,
                overdueReturns: overdueCount,
                distribution: {
                    shelf: shelfCount,
                    reference: refCount,
                    periodicals: periodicalCount,
                    digital: digitalCount
                },
                operations: {
                    totalTransactions,
                    totalFines: totalFines || 0
                },
                services: {
                    availableSeats: availableSeats || 0,
                    activeReservations,
                    openTickets
                }
            },
            recentTransactions,
            recentBooks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
