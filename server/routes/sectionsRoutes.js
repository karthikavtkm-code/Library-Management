const express = require('express');
const router = express.Router();
const sectionsController = require('../controllers/sectionsController');
const { auth } = require('../middleware/authMiddleware');

router.use(auth);

// Shelves
router.get('/shelves', sectionsController.getShelves);
router.post('/shelves', sectionsController.createShelf);
router.put('/shelves/:id', sectionsController.updateShelf);
router.delete('/shelves/:id', sectionsController.deleteShelf);
router.get('/shelves/:id/books', sectionsController.getShelfBooks);

// Categories
router.get('/categories', sectionsController.getCategories);
router.post('/categories', sectionsController.createCategory);

// Periodicals
router.get('/periodicals', sectionsController.getPeriodicals);
router.post('/periodicals', sectionsController.createPeriodical);

// Digital Resources
router.get('/digital-resources', sectionsController.getDigitalResources);
router.post('/digital-resources', sectionsController.createDigitalResource);
router.put('/digital-resources/:id', sectionsController.updateDigitalResource);
router.delete('/digital-resources/:id', sectionsController.deleteDigitalResource);

// Formats
router.get('/formats', sectionsController.getBookFormats);

module.exports = router;
