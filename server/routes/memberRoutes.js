const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

const { auth, authorize } = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', authorize('admin', 'librarian'), memberController.getAllMembers);
router.post('/', authorize('admin', 'librarian'), memberController.addMember);
router.put('/:id', authorize('admin', 'librarian'), memberController.updateMember);
router.delete('/:id', authorize('admin'), memberController.deleteMember);
router.get('/:id/history', authorize('admin', 'librarian', 'member'), memberController.getMemberHistory);

module.exports = router;
