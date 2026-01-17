const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchItems);
router.post('/', authorize('admin', 'librarian'), bookController.addBook);
router.put('/:id', authorize('admin', 'librarian'), bookController.updateBook);
router.delete('/:id', authorize('admin'), bookController.deleteBook);

module.exports = router;
