const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, garageDetails } = req.body;
        
        // Check if user exists
        const [existing] = await pool.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'user']
        );
        
        const userId = result.insertId;

        if (role === 'provider' && garageDetails) {
            await pool.execute(
                'INSERT INTO service_centers (user_id, name, address, latitude, longitude, opening_time, closing_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, garageDetails.name, garageDetails.address, garageDetails.latitude || null, garageDetails.longitude || null, garageDetails.opening_time || '09:00:00', garageDetails.closing_time || '18:00:00']
            );
        }

        const token = jwt.sign({ id: userId, role: role || 'user' }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'User created', token, user: { id: userId, name, email, role: role || 'user' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        
        // Don't send password
        delete user.password;
        
        res.json({ message: 'Login successful', token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id, name } = req.body;
        await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Profile deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
