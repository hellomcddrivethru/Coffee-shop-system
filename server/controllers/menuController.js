const db = require('../db');
const getMenu = (req, res) => {
    const sql = 'SELECT * FROM menuitem WHERE IsAvailable = 1';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

const getAllMenu = (req, res) => {
    const sql = 'SELECT * FROM menuitem ORDER BY ItemID';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

const addMenuItem = (req, res) => {
    const { name, category, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price required' });
    }

    const sql = `
        INSERT INTO menuitem (ItemName, Category, Price, IsAvailable)
        VALUES (?, ?, ?, 1)
    `;

    db.query(
        sql,
        [name.toUpperCase(), category || 'hot', price],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                ItemID: result.insertId
            });
        }
    );
};

const updateMenuItem = (req, res) => {
    const { name, category, price } = req.body;
    const id = req.params.id;

    const sql = `
        UPDATE menuitem
        SET ItemName = ?, Category = ?, Price = ?
        WHERE ItemID = ?
    `;

    db.query(
        sql,
        [name.toUpperCase(), category, price, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ success: true });
        }
    );
};

const disableMenuItem = (req, res) => {
    const id = req.params.id;

    db.query(
        'UPDATE menuitem SET IsAvailable = 0 WHERE ItemID = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ success: true });
        }
    );
};

const enableMenuItem = (req, res) => {
    const id = req.params.id;

    db.query(
        'UPDATE menuitem SET IsAvailable = 1 WHERE ItemID = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ success: true });
        }
    );
};

const deleteMenuItem = (req, res) => {
    const id = req.params.id;

    db.query(
        'SELECT COUNT(*) AS count FROM orderdetails WHERE ItemID = ?',
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result[0].count > 0) {
                return res.status(400).json({
                    error: 'Cannot delete item used in orders'
                });
            }

            db.query(
                'DELETE FROM menuitem WHERE ItemID = ?',
                [id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({ success: true });
                }
            );
        }
    );
};

module.exports = {
    getMenu,
    getAllMenu,
    addMenuItem,
    updateMenuItem,
    disableMenuItem,
    enableMenuItem,
    deleteMenuItem
};