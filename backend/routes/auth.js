const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/update-profile', authController.updateProfile);
router.delete('/delete-profile/:id', authController.deleteProfile);

module.exports = router;
