const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

const { auth, authorize } = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', authorize('admin', 'librarian'), transactionController.getAllTransactions);
router.post('/issue', authorize('admin', 'librarian'), transactionController.issueBook);
router.post('/return', authorize('admin', 'librarian'), transactionController.returnBook);

module.exports = router;
