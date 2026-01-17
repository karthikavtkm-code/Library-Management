const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/nodeController');
const { auth } = require('../middleware/authMiddleware');

router.use(auth);

router.post('/', nodeController.createNode);
router.get('/', nodeController.getHierarchy);
router.get('/:id', nodeController.getNode);
router.put('/:id', nodeController.updateNode);
router.delete('/:id', nodeController.deleteNode);

module.exports = router;
