import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../styles/global.css";
import "../styles/dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState("all");
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, avgOrder: 0, totalItems: 0 });
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const salesChartRef = useRef(null);
    const topItemsChartRef = useRef(null);
    const categoryChartRef = useRef(null);
    const orderSummaryChartRef = useRef(null);
    
    const chartInstances = useRef({
        sales: null,
        topItems: null,
        category: null,
        orderSummary: null
    });

    const API_URL = "http://localhost:5000/api";

    const destroyCharts = () => {
        if (chartInstances.current.sales) { chartInstances.current.sales.destroy(); chartInstances.current.sales = null; }
        if (chartInstances.current.topItems) { chartInstances.current.topItems.destroy(); chartInstances.current.topItems = null; }
        if (chartInstances.current.category) { chartInstances.current.category.destroy(); chartInstances.current.category = null; }
        if (chartInstances.current.orderSummary) { chartInstances.current.orderSummary.destroy(); chartInstances.current.orderSummary = null; }
    };

    const getDateRange = () => {
        const now = new Date();
        let start = new Date();
        
        switch(period) {
            case "today":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "week":
                start.setDate(now.getDate() - 7);
                break;
            case "month":
                start.setMonth(now.getMonth() - 1);
                break;
            case "year":
                start.setFullYear(now.getFullYear() - 1);
                break;
            case "all":
                start = new Date(2024, 0, 1);
                break;
            default:
                start = new Date(2024, 0, 1);
        }
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        return {
            start: formatDate(start),
            end: formatDate(now)
        };
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const dates = getDateRange();
            
            console.log(`📅 Period: ${period} | ${dates.start} to ${dates.end}`);
            
            // Use the CORRECT date parameters
            const statsUrl = `${API_URL}/reports/sales-stats?startDate=${dates.start}&endDate=${dates.end}`;
            const topItemsUrl = `${API_URL}/reports/top-items?startDate=${dates.start}&endDate=${dates.end}&limit=5`;
            const ordersUrl = `${API_URL}/orders/orders`;
            
            console.log("Fetching stats:", statsUrl);
            
            const [statsRes, topItemsRes, ordersRes] = await Promise.all([
                fetch(statsUrl),
                fetch(topItemsUrl),
                fetch(ordersUrl)
            ]);
            
            const statsData = await statsRes.json();
            const topItemsData = await topItemsRes.json();
            const ordersData = await ordersRes.json();
            
            console.log("Stats received:", statsData);
            
            setStats({
                totalOrders: statsData.totalOrders || 0,
                totalRevenue: statsData.totalRevenue || 0,
                avgOrder: statsData.avgOrder || 0,
                totalItems: statsData.totalItems || 0
            });
            setTopItems(topItemsData || []);
            
            destroyCharts();
            
            setTimeout(() => {
                if (ordersData && ordersData.length > 0) {
                    renderSalesTrendChart(ordersData, dates);
                    renderOrderSummaryChart(ordersData, dates);
                }
                if (topItemsData && topItemsData.length > 0) {
                    renderTopItemsChart(topItemsData);
                    renderCategoryChart(topItemsData);
                }
            }, 100);
            
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderSalesTrendChart = (orders, dateRange) => {
        if (!salesChartRef.current) return;
        const ctx = salesChartRef.current.getContext('2d');
        
        // Filter orders by date range
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.OrderDate).toISOString().split('T')[0];
            return orderDate >= dateRange.start && orderDate <= dateRange.end;
        });
        
        const salesByDay = {};
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('en-MY', { weekday: 'short' });
            last7Days.push(dayLabel);
            salesByDay[dateStr] = 0;
        }
        
        filteredOrders.forEach(order => {
            const orderDate = new Date(order.OrderDate).toISOString().split('T')[0];
            if (salesByDay[orderDate] !== undefined) {
                salesByDay[orderDate] += parseFloat(order.TotalAmount) || 0;
            }
        });
        
        const salesData = last7Days.map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            return salesByDay[dateStr] || 0;
        });
        
        chartInstances.current.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Sales (RM)',
                    data: salesData,
                    borderColor: '#4b672f',
                    backgroundColor: 'rgba(75, 103, 47, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4b672f',
                    pointBorderColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Sales (RM)' } } }
            }
        });
    };

    const renderTopItemsChart = (items) => {
        if (!topItemsChartRef.current) return;
        const ctx = topItemsChartRef.current.getContext('2d');
        
        chartInstances.current.topItems = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: items.map(i => i.ItemName),
                datasets: [{
                    label: 'Quantity Sold',
                    data: items.map(i => parseInt(i.TotalSold) || 0),
                    backgroundColor: '#4b672f',
                    borderRadius: 8,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Quantity Sold' } } }
            }
        });
    };

    const renderCategoryChart = (items) => {
        if (!categoryChartRef.current) return;
        const ctx = categoryChartRef.current.getContext('2d');
        
        let hotCount = 0, icedCount = 0;
        items.forEach(item => {
            if (item.Category === 'hot') hotCount += parseInt(item.TotalSold) || 0;
            else icedCount += parseInt(item.TotalSold) || 0;
        });
        
        chartInstances.current.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Hot Coffee', 'Iced Coffee'],
                datasets: [{ data: [hotCount || 1, icedCount || 1], backgroundColor: ['#4b672f', '#322A26'], borderWidth: 0 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    };

    const renderOrderSummaryChart = (orders, dateRange) => {
        if (!orderSummaryChartRef.current) return;
        const ctx = orderSummaryChartRef.current.getContext('2d');
        
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.OrderDate).toISOString().split('T')[0];
            return orderDate >= dateRange.start && orderDate <= dateRange.end;
        });
        
        const avgByDay = {};
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('en-MY', { weekday: 'short' });
            last7Days.push(dayLabel);
            avgByDay[dateStr] = { total: 0, count: 0 };
        }
        
        filteredOrders.forEach(order => {
            const orderDate = new Date(order.OrderDate).toISOString().split('T')[0];
            if (avgByDay[orderDate]) {
                avgByDay[orderDate].total += parseFloat(order.TotalAmount) || 0;
                avgByDay[orderDate].count += 1;
            }
        });
        
        const avgValues = last7Days.map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const dayData = avgByDay[dateStr];
            return dayData.count > 0 ? dayData.total / dayData.count : 0;
        });
        
        chartInstances.current.orderSummary = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Average Order (RM)',
                    data: avgValues,
                    borderColor: '#2c1810',
                    backgroundColor: 'rgba(44, 24, 16, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#2c1810',
                    pointBorderColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Average Order (RM)' } } }
            }
        });
    };

    const handlePeriodChange = (newPeriod) => {
        console.log("Changing period to:", newPeriod);
        setPeriod(newPeriod);
    };

    useEffect(() => {
        loadDashboardData();
        return () => destroyCharts();
    }, [period]);

    if (loading) {
        return <div className="dashboard-container"><div className="loading">Loading dashboard...</div></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📊 Dashboard Analytics</h1>
                <div className="button-group">
                    <button className="nav-btn" onClick={() => navigate("/manager")}>← Back to Manager</button>
                    <button className="nav-btn" onClick={() => navigate("/reports")}>Detailed Reports</button>
                    <button className="nav-btn" onClick={loadDashboardData}>🔄 Refresh</button>
                </div>
            </div>

            <div className="time-filter">
                <button className={`filter-btn ${period === 'today' ? 'active' : ''}`} onClick={() => handlePeriodChange('today')}>Today</button>
                <button className={`filter-btn ${period === 'week' ? 'active' : ''}`} onClick={() => handlePeriodChange('week')}>This Week</button>
                <button className={`filter-btn ${period === 'month' ? 'active' : ''}`} onClick={() => handlePeriodChange('month')}>This Month</button>
                <button className={`filter-btn ${period === 'year' ? 'active' : ''}`} onClick={() => handlePeriodChange('year')}>This Year</button>
                <button className={`filter-btn ${period === 'all' ? 'active' : ''}`} onClick={() => handlePeriodChange('all')}>All Time</button>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-info">
                        <div className="kpi-value">RM{stats.totalRevenue.toFixed(2)}</div>
                        <div className="kpi-label">Total Revenue</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-info">
                        <div className="kpi-value">{stats.totalOrders}</div>
                        <div className="kpi-label">Total Orders</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-info">
                        <div className="kpi-value">{stats.totalItems}</div>
                        <div className="kpi-label">Items Sold</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-info">
                        <div className="kpi-value">RM{stats.avgOrder.toFixed(2)}</div>
                        <div className="kpi-label">Average Order</div>
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>📈 Sales Trend</h3>
                    <canvas ref={salesChartRef} width="400" height="250"></canvas>
                </div>
                <div className="chart-card">
                    <h3>🏆 Top 5 Selling Items</h3>
                    <canvas ref={topItemsChartRef} width="400" height="250"></canvas>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>🥧 Sales by Category</h3>
                    <canvas ref={categoryChartRef} width="400" height="250"></canvas>
                </div>
                <div className="chart-card">
                    <h3>📊 Order Summary</h3>
                    <canvas ref={orderSummaryChartRef} width="400" height="250"></canvas>
                </div>
            </div>
        </div>
    );
}