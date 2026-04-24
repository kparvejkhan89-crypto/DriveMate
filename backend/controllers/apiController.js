const pool = require('../config/db');

// --- NOTIFICATIONS HELPER ---
const createNotification = async (userId, title, message) => {
    try {
        await pool.execute(
            'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
            [userId, title, message]
        );
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};


// --- VEHICLES ---
exports.getVehicles = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addVehicle = async (req, res) => {
    try {
        const { brand, model, number, year } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO vehicles (user_id, brand, model, number, year) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, brand, model, number, year]
        );
        res.status(201).json({ id: result.insertId, brand, model, number, year });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- SERVICE CENTERS ---
exports.getServiceCenters = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM service_centers ORDER BY rating DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getProviderServices = async (req, res) => {
    try {
        if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
        const [centers] = await pool.execute('SELECT * FROM service_centers WHERE user_id = ?', [req.user.id]);
        res.json(centers[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProviderServices = async (req, res) => {
    try {
        if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
        
        const { name, address, latitude, longitude, opening_time, closing_time, services_offered, closed_days } = req.body;
        
        // Ensure provider owns a service center
        const [centers] = await pool.execute('SELECT * FROM service_centers WHERE user_id = ?', [req.user.id]);
        if (centers.length === 0) return res.status(404).json({ error: 'Service center not found' });
        
        await pool.execute(
            'UPDATE service_centers SET name = ?, address = ?, latitude = ?, longitude = ?, opening_time = ?, closing_time = ?, services_offered = ?, closed_days = ? WHERE user_id = ?',
            [name || centers[0].name, address || centers[0].address, latitude || centers[0].latitude, longitude || centers[0].longitude, opening_time || centers[0].opening_time, closing_time || centers[0].closing_time, services_offered !== undefined ? services_offered : centers[0].services_offered, closed_days !== undefined ? closed_days : centers[0].closed_days, req.user.id]
        );

        res.json({ message: 'Garage details updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- MANAGED SERVICES (PROVIDER SPECIFIC PRICED SERVICES) ---
exports.getManagedServices = async (req, res) => {
    try {
        if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
        const [centers] = await pool.execute('SELECT id FROM service_centers WHERE user_id = ?', [req.user.id]);
        if (centers.length === 0) return res.json([]);
        
        const [rows] = await pool.execute('SELECT * FROM provider_services WHERE center_id = ? ORDER BY created_at ASC', [centers[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

exports.addManagedService = async (req, res) => {
    try {
        if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
        const { name, price } = req.body;
        const [centers] = await pool.execute('SELECT id FROM service_centers WHERE user_id = ?', [req.user.id]);
        if (centers.length === 0) return res.status(400).json({ error: 'Please configure your garage in Profile first.' });
        
        const [result] = await pool.execute(
            'INSERT INTO provider_services (center_id, name, price) VALUES (?, ?, ?)',
            [centers[0].id, name, price || 0]
        );
        res.status(201).json({ id: result.insertId, name, price: price || 0 });
    } catch (err) {
        console.error(err); res.status(500).json({ error: err.message || 'Server error' });
    }
};

exports.updateManagedService = async (req, res) => {
    try {
        if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
        const { name, price } = req.body;
        const [centers] = await pool.execute('SELECT id FROM service_centers WHERE user_id = ?', [req.user.id]);
        if (centers.length === 0) return res.status(400).json({ error: 'No garage found.' });
        
        await pool.execute(
            'UPDATE provider_services SET name = ?, price = ? WHERE id = ? AND center_id = ?',
            [name, price, req.params.id, centers[0].id]
        );
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteManagedService = async (req, res) => {
    try {
        if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
        const [centers] = await pool.execute('SELECT id FROM service_centers WHERE user_id = ?', [req.user.id]);
        if (centers.length === 0) return res.status(400).json({ error: 'No garage found.' });
        
        await pool.execute('DELETE FROM provider_services WHERE id = ? AND center_id = ?', [req.params.id, centers[0].id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

exports.getCenterServicesList = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM provider_services WHERE center_id = ? ORDER BY created_at ASC', [req.params.id]);
        res.json(rows);
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

// --- BOOKINGS ---
exports.getBookings = async (req, res) => {
    try {
        let query = '';
        let params = [];
        if (req.user.role === 'user') {
            query = `
                SELECT b.*, s.name as center_name, s.address as center_address, s.latitude as center_lat, s.longitude as center_lng 
                FROM bookings b 
                JOIN service_centers s ON b.center_id = s.id 
                WHERE b.user_id = ? 
                ORDER BY b.date DESC, b.time DESC
            `;
            params = [req.user.id];
        } else if (req.user.role === 'provider') {
            query = `
                SELECT b.*, u.name as user_name, u.email as user_email
                FROM bookings b 
                JOIN service_centers s ON b.center_id = s.id 
                JOIN users u ON b.user_id = u.id
                WHERE s.user_id = ? 
                ORDER BY b.date DESC, b.time DESC
            `;
            params = [req.user.id];
        }
        
        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addBooking = async (req, res) => {
    try {
        const { center_id, date, time, service_type } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO bookings (user_id, center_id, date, time, status, service_type) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, center_id, date, time, 'pending', service_type]
        );
        const [centers] = await pool.execute('SELECT name, user_id FROM service_centers WHERE id = ?', [center_id]);
        if (centers.length > 0) {
            await createNotification(centers[0].user_id, 'New Booking Request', `A new booking request for ${service_type} has been received.`);
        }

        res.status(201).json({ id: result.insertId, center_id, date, time, status: 'pending', service_type });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        if (req.user.role === 'provider') {
            const [bookings] = await pool.execute(
                'SELECT b.*, s.name as center_name FROM bookings b JOIN service_centers s ON b.center_id = s.id WHERE b.id = ? AND s.user_id = ?',
                [id, req.user.id]
            );
            if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found or access denied' });
            
            const booking = bookings[0];
            let query = 'UPDATE bookings SET status = ? WHERE id = ?';
            let params = [status, id];
            
            if (status === 'rejected' && req.body.reason) {
                query = 'UPDATE bookings SET status = ?, rejection_reason = ? WHERE id = ?';
                params = [status, req.body.reason, id];
            } else if (status === 'completed' && req.body.cost) {
                query = 'UPDATE bookings SET status = ?, cost = ? WHERE id = ?';
                params = [status, req.body.cost, id];
                await pool.execute('INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, CURDATE())', [booking.user_id, req.body.cost, `Service at ${booking.center_name}`]);
            }
            
            await pool.execute(query, params);
            
            // Send notification to user
            await createNotification(booking.user_id, `Booking ${status}`, `Your booking for ${booking.service_type} at ${booking.center_name} has been ${status}.`);
            
            res.json({ message: 'Status updated successfully', status });
        } else if (req.user.role === 'user') {
            if (status !== 'cancelled') return res.status(403).json({ error: 'Users can only cancel bookings' });
            
            const [bookings] = await pool.execute(
                'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
                [id, req.user.id]
            );
            if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found or access denied' });
            
            await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
            res.json({ message: 'Booking cancelled successfully', status });
        } else {
            return res.status(403).json({ error: 'Forbidden' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.rateBooking = async (req, res) => {
    try {
        const { ratingScore } = req.body;
        const { id } = req.params;
        
        if (req.user.role !== 'user') return res.status(403).json({ error: 'Only users can rate garages' });
        if (!ratingScore || ratingScore < 1 || ratingScore > 5) return res.status(400).json({ error: 'Invalid rating' });
        
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });
        
        const booking = bookings[0];
        if (booking.status !== 'completed') return res.status(400).json({ error: 'Only completed bookings can be rated' });
        if (booking.is_rated) return res.status(400).json({ error: 'Booking has already been rated' });
        
        const [centers] = await pool.execute('SELECT rating, rating_count FROM service_centers WHERE id = ?', [booking.center_id]);
        if (centers.length === 0) return res.status(404).json({ error: 'Garage not found' });
        
        const center = centers[0];
        const newCount = center.rating_count + 1;
        const newRating = ((parseFloat(center.rating) * center.rating_count) + ratingScore) / newCount;
        
        await pool.execute('UPDATE service_centers SET rating = ?, rating_count = ? WHERE id = ?', [newRating.toFixed(1), newCount, booking.center_id]);
        await pool.execute('UPDATE bookings SET is_rated = TRUE, rating = ? WHERE id = ?', [ratingScore, id]);
        
        res.json({ message: 'Rating submitted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- EXPENSES ---
exports.getExpenses = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { amount, category, date } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, ?)',
            [req.user.id, amount, category, date]
        );
        res.status(201).json({ id: result.insertId, amount, category, date });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- DASHBOARD STATS ---
exports.getStats = async (req, res) => {
    try {
        if (req.user.role === 'user') {
            const [vehicles] = await pool.execute('SELECT COUNT(*) as count FROM vehicles WHERE user_id = ?', [req.user.id]);
            const [bookings] = await pool.execute('SELECT COUNT(*) as count FROM bookings WHERE user_id = ?', [req.user.id]);
            const [expenses] = await pool.execute('SELECT SUM(amount) as total FROM expenses WHERE user_id = ?', [req.user.id]);
            
            res.json({
                vehiclesCount: vehicles[0].count,
                bookingsCount: bookings[0].count,
                totalExpenses: expenses[0].total || 0
            });
        } else {
            const [myCenter] = await pool.execute('SELECT id FROM service_centers WHERE user_id = ?', [req.user.id]);
            if (myCenter.length === 0) return res.json({ bookingsCount: 0, pendingCount: 0 });
            
            const centerId = myCenter[0].id;
            const [bookings] = await pool.execute('SELECT COUNT(*) as count FROM bookings WHERE center_id = ?', [centerId]);
            const [pending] = await pool.execute('SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND status = "pending"', [centerId]);
            const [earnings] = await pool.execute('SELECT SUM(cost) as total FROM bookings WHERE center_id = ? AND status = "completed"', [centerId]);
            res.json({
                bookingsCount: bookings[0].count,
                pendingCount: pending[0].count,
                totalEarnings: earnings[0].total || 0
            });
        }
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

// --- NOTIFICATIONS ---
exports.getNotifications = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

// --- CHAT ---
exports.getMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;
        console.log(`Fetching messages for booking: ${bookingId}`);
        const [rows] = await pool.query(`
            SELECT m.*, u.name as sender_name 
            FROM messages m 
            LEFT JOIN users u ON m.sender_id = u.id 
            WHERE m.booking_id = ? 
            ORDER BY m.created_at ASC
        `, [parseInt(bookingId)]);
        console.log(`Found ${rows.length} messages`);
        res.setHeader('Cache-Control', 'no-cache');
        res.json(rows);

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { bookingId, message } = req.body;
        await pool.execute(
            'INSERT INTO messages (booking_id, sender_id, message) VALUES (?, ?, ?)',
            [bookingId, req.user.id, message]
        );
        
        // Notify the other party
        const [booking] = await pool.execute(`
            SELECT b.user_id, s.user_id as provider_id, b.service_type 
            FROM bookings b 
            JOIN service_centers s ON b.center_id = s.id 
            WHERE b.id = ?
        `, [bookingId]);
        
        if (booking.length > 0) {
            const recipientId = req.user.id === booking[0].user_id ? booking[0].provider_id : booking[0].user_id;
            await createNotification(recipientId, 'New Message', `You have a new message regarding booking for ${booking[0].service_type}.`);
        }

        res.status(201).json({ message: 'Sent' });
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

// --- ADMIN ---
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
        const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllGarages = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
        const [rows] = await pool.execute('SELECT * FROM service_centers');
        res.json(rows);
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' });
    }
};

