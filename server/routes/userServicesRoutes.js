const express = require('express');
const router = express.Router();
const userServicesController = require('../controllers/userServicesController');
const { auth } = require('../middleware/authMiddleware');

router.use(auth);

router.get('/reading-rooms', userServicesController.getReadingRooms);
router.post('/reading-rooms', userServicesController.createReadingRoom);

router.get('/reservations', userServicesController.getReservations);
router.post('/reservations', userServicesController.createReservation);

router.get('/help-desk', userServicesController.getHelpDeskTickets);
router.post('/help-desk', userServicesController.createHelpDeskTicket);

router.get('/activity', userServicesController.getUserActivity);

module.exports = router;
