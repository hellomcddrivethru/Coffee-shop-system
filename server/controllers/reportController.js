const db = require('../db');

// ================================
// 1. MENU WITH SALES
// ================================
const getMenuWithSales = (req, res) => {
    const query = `
        SELECT 
            mi.ItemID,
            mi.ItemName,
            mi.Category,
            mi.Price,
            mi.IsAvailable,
            COALESCE(SUM(od.Quantity), 0) as TotalSold
        FROM menuitem mi
        LEFT JOIN orderdetails od ON mi.ItemID = od.ItemID
        GROUP BY mi.ItemID
        ORDER BY TotalSold DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// ================================
// 2. TOP SELLING ITEMS
// ================================
const getTopItems = (req, res) => {
    const { startDate, endDate, limit } = req.query;

    let query = `
        SELECT 
            mi.ItemName,
            mi.Category,
            mi.Price,
            SUM(od.Quantity) as TotalSold,
            SUM(od.Subtotal) as TotalRevenue
        FROM orderdetails od
        JOIN menuitem mi ON od.ItemID = mi.ItemID
        JOIN orders o ON od.OrderID = o.OrderID
        WHERE 1=1
    `;

    const params = [];

    if (startDate && endDate) {
        query += ` AND DATE(o.OrderDate) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }

    query += `
        GROUP BY mi.ItemID
        ORDER BY TotalSold DESC
        LIMIT ?
    `;

    params.push(parseInt(limit) || 10);

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// ================================
// 3. SALES STATISTICS - RETURNS ALL ORDERS
// ================================
const getSalesStats = (req, res) => {
    const { startDate, endDate } = req.query;
    
    console.log("=== SALES STATS ===");
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    
    // Get ALL orders - NO filters
    let orderQuery = `
        SELECT 
            COUNT(*) as totalOrders,
            SUM(TotalAmount) as totalRevenue,
            AVG(TotalAmount) as avgOrder
        FROM orders
    `;
    
    const params = [];
    
    // Only add date filter if both are provided
    if (startDate && endDate && startDate !== 'undefined' && endDate !== 'undefined') {
        orderQuery += ` WHERE DATE(OrderDate) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }
    
    db.query(orderQuery, params, (err, orderResults) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let itemsQuery = `
            SELECT SUM(od.Quantity) as totalItems 
            FROM orderdetails od
            JOIN orders o ON od.OrderID = o.OrderID
        `;
        
        if (params.length > 0) {
            itemsQuery += ` WHERE DATE(o.OrderDate) BETWEEN ? AND ?`;
        }
        
        db.query(itemsQuery, params, (err2, itemResults) => {
            if (err2) return res.status(500).json({ error: err2.message });
            
            const response = {
                totalOrders: orderResults[0]?.totalOrders || 0,
                totalRevenue: parseFloat(orderResults[0]?.totalRevenue) || 0,
                avgOrder: parseFloat(orderResults[0]?.avgOrder) || 0,
                totalItems: itemResults[0]?.totalItems || 0
            };
            
            console.log("SALES STATS RESPONSE:", response);
            res.json(response);
        });
    });
};

// ================================
// 4. CASHIER PERFORMANCE
// ================================
const getOrdersWithEmployees = (req, res) => {
    const { startDate, endDate } = req.query;

    let query = `
        SELECT 
            e.EmployeeID,
            e.Name,
            COUNT(o.OrderID) as orders,
            COALESCE(SUM(o.TotalAmount), 0) as revenue
        FROM employee e
        LEFT JOIN orders o ON e.EmployeeID = o.EmployeeID
        WHERE e.Role = 'cashier'
    `;

    const params = [];

    if (startDate && endDate) {
        query += ` AND DATE(o.OrderDate) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }

    query += `
        GROUP BY e.EmployeeID
        ORDER BY orders DESC
    `;

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

module.exports = {
    getMenuWithSales,
    getTopItems,
    getSalesStats,
    getOrdersWithEmployees
};