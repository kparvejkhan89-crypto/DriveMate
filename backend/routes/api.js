const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all routes below

// Vehicles
router.get('/vehicles', apiController.getVehicles);
router.post('/vehicles', apiController.addVehicle);

// Service Centers
router.get('/service-centers', apiController.getServiceCenters);
router.get('/provider-services', apiController.getProviderServices);
router.put('/provider-services', apiController.updateProviderServices);

// Managed Services (Pricing list)
router.get('/managed-services', apiController.getManagedServices);
router.post('/managed-services', apiController.addManagedService);
router.put('/managed-services/:id', apiController.updateManagedService);
router.delete('/managed-services/:id', apiController.deleteManagedService);
router.get('/service-centers/:id/services', apiController.getCenterServicesList);

// Bookings
router.get('/bookings', apiController.getBookings);
router.post('/bookings', apiController.addBooking);
router.put('/bookings/:id', apiController.updateBookingStatus);
router.post('/bookings/:id/rate', apiController.rateBooking);

// Expenses
router.get('/expenses', apiController.getExpenses);
router.post('/expenses', apiController.addExpense);

// Dashboard Stats
router.get('/stats', apiController.getStats);

module.exports = router;
