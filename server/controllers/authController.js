const db = require('../db');
const bcrypt = require('bcrypt');

// LOGIN
const handleLogin = (role) => async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.query(
        'SELECT * FROM employee WHERE Username = ? AND Role = ?',
        [username, role],
        async (err, users) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!users || users.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = users[0];

            const isValid = await bcrypt.compare(password, user.Password);

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const { Password, ...safeUser } = user;

            res.json({
                success: true,
                user: safeUser
            });
        }
    );
};

// REGISTER
const register = async (req, res) => {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO employee (Name, Username, Password, Role) VALUES (?, ?, ?, ?)',
            [name, username, hashed, role],
            (err) => {
                if (err?.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Username exists' });
                }

                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ success: true });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleLogin, register };