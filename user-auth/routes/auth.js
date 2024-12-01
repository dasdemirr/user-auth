const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kullanıcı verilerini hafızada tutacağız
let users = [];

// Kullanıcı Kayıt
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // E-posta ve kullanıcı adı kontrolü
    const userExists = users.find(user => user.email === email || user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Yeni kullanıcıyı hafızaya ekle
        users.push({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Kullanıcı Giriş
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});

module.exports = router;