const db = require('../db');

// CREATE ORDER (checkout)
const checkout = (req, res) => {
    const { items, total, employeeId } = req.body;

    if (!items?.length) {
        return res.status(400).json({ error: 'No items in order' });
    }

    db.query(
        'INSERT INTO orders (OrderDate, TotalAmount, EmployeeID, PaymentStatus) VALUES (NOW(), ?, ?, "pending")',
        [total, employeeId || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const orderId = result.insertId;
            let completed = 0;

            if (items.length === 0) {
                return res.json({ success: true, orderId });
            }

            for (const item of items) {
                db.query(
                    'SELECT ItemID FROM menuitem WHERE ItemName = ?',
                    [item.name],
                    (err, itemResult) => {

                        if (!err && itemResult?.length) {
                            db.query(
                                'INSERT INTO orderdetails (OrderID, ItemID, Quantity, Subtotal) VALUES (?, ?, ?, ?)',
                                [orderId, itemResult[0].ItemID, 1, item.price]
                            );
                        }

                        completed++;

                        if (completed === items.length) {
                            res.json({ success: true, orderId });
                        }
                    }
                );
            }
        }
    );
};

// GET ALL ORDERS
const getOrders = (req, res) => {
    db.query(`
        SELECT o.OrderID, o.OrderDate, o.TotalAmount,
        COUNT(od.OrderDetailID) as ItemCount
        FROM orders o
        LEFT JOIN orderdetails od ON o.OrderID = od.OrderID
        GROUP BY o.OrderID
        ORDER BY o.OrderDate DESC
    `, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// GET ORDER BY ID
const getOrderById = (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM orders WHERE OrderID = ?', [id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!order?.length) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.query(`
            SELECT od.Quantity, od.Subtotal, mi.ItemName
            FROM orderdetails od
            JOIN menuitem mi ON od.ItemID = mi.ItemID
            WHERE od.OrderID = ?
        `, [id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ order: order[0], items: items || [] });
        });
    });
};

// DELETE ORDER
const deleteOrder = (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM orderdetails WHERE OrderID = ?', [id], () => {
        db.query('DELETE FROM orders WHERE OrderID = ?', [id], (err, result) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({ success: true });
        });
    });
};

// PAYMENT UPDATE
const updatePayment = (req, res) => {
    const id = req.params.id;
    const { paymentMethod, paymentStatus } = req.body;

    if (!paymentMethod) {
        return res.status(400).json({ error: 'Payment method required' });
    }

    db.query(
        'UPDATE orders SET PaymentMethod = ?, PaymentStatus = ? WHERE OrderID = ?',
        [paymentMethod, paymentStatus || 'completed', id],
        (err, result) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({ success: true });
        }
    );
};

module.exports = {
    checkout,
    getOrders,
    getOrderById,
    deleteOrder,
    updatePayment
};