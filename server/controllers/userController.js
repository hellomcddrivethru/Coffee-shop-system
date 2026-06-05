const db = require('../db');
const bcrypt = require('bcrypt');

const getUsers = (req, res) => {
    db.query(
        'SELECT EmployeeID, Name, Username, Role FROM employee ORDER BY EmployeeID',
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json(results);
        }
    );
};

const updateUser = async (req, res) => {
    const { name, role, password } = req.body;
    const userId = req.params.id;

    if (password && password.trim() !== '') {

        const hashedPassword =
            await bcrypt.hash(password, 10);

        db.query(
            'UPDATE employee SET Name=?, Role=?, Password=? WHERE EmployeeID=?',
            [name, role, hashedPassword, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({ success: true });
            }
        );

    } else {

        db.query(
            'UPDATE employee SET Name=?, Role=? WHERE EmployeeID=?',
            [name, role, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({ success: true });
            }
        );
    }
};

const deleteUser = (req, res) => {

    const userId = req.params.id;

    db.query(
        'DELETE FROM employee WHERE EmployeeID=?',
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json({
                success: true
            });
        }
    );
};

module.exports = {
    getUsers,
    updateUser,
    deleteUser
};