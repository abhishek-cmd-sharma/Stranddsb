const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUser).put(protect, admin, updateUser).delete(protect, admin, deleteUser);

module.exports = router;
