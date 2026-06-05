import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../styles/global.css";
import "../styles/performance.css";

export default function Performance() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState("all");
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const ordersChartRef = useRef(null);
    const revenueChartRef = useRef(null);
    let ordersChart = null;
    let revenueChart = null;

    const API_URL = "http://localhost:5000/api";

    const getDateRange = () => {
        // Always use wide range to see ALL data
        return {
            start: "2020-01-01",
            end: "2030-12-31"
        };
    };

    const destroyCharts = () => {
        if (ordersChart) { ordersChart.destroy(); ordersChart = null; }
        if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
    };

    const loadPerformanceData = async () => {
        setLoading(true);
        try {
            const dates = getDateRange();
            // Add timestamp to prevent caching
            const url = `${API_URL}/reports/orders-with-employees?startDate=${dates.start}&endDate=${dates.end}&_=${Date.now()}`;
            
            console.log("Fetching:", url);
            
            const response = await fetch(url, {
                cache: 'no-cache',
                headers: { 'Cache-Control': 'no-cache' }
            });
            const data = await response.json();
            
            console.log("Data received:", data);
            
            setPerformance(data || []);
            
            const totalCashiers = data.filter(c => c.orders > 0).length;
            const totalOrders = data.reduce((sum, c) => sum + (parseInt(c.orders) || 0), 0);
            const totalRevenue = data.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0);
            const avgPerCashier = totalCashiers > 0 ? (totalOrders / totalCashiers).toFixed(1) : 0;
            
            setStats({ totalCashiers, totalOrders, totalRevenue, avgPerCashier });
            
            destroyCharts();
            
            setTimeout(() => {
                renderOrdersChart(data);
                renderRevenueChart(data);
            }, 100);
            
        } catch (error) {
            console.error("Error loading performance:", error);
        } finally {
            setLoading(false);
        }
    };

    const [stats, setStats] = useState({ 
        totalCashiers: 0, 
        totalOrders: 0, 
        totalRevenue: 0, 
        avgPerCashier: 0 
    });

    const renderOrdersChart = (data) => {
        if (!ordersChartRef.current) return;
        
        const ctx = ordersChartRef.current.getContext('2d');
        
        const sorted = [...data].sort((a, b) => b.orders - a.orders);
        const labels = sorted.map(c => c.Name);
        const orderCounts = sorted.map(c => parseInt(c.orders) || 0);
        
        ordersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Orders',
                    data: orderCounts,
                    backgroundColor: '#4b672f',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Orders' } } }
            }
        });
    };

    const renderRevenueChart = (data) => {
        if (!revenueChartRef.current) return;
        
        const ctx = revenueChartRef.current.getContext('2d');
        
        const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
        const labels = sorted.map(c => c.Name);
        const revenues = sorted.map(c => parseFloat(c.revenue) || 0);
        
        revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (RM)',
                    data: revenues,
                    backgroundColor: '#4b672f',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Revenue (RM)' } } }
            }
        });
    };

    // Manual refresh button
    const handleRefresh = () => {
        console.log("Manual refresh triggered");
        loadPerformanceData();
    };

    useEffect(() => {
        loadPerformanceData();
        return () => destroyCharts();
    }, []); // Only runs once on mount, not on period change

    const maxOrders = performance.length ? Math.max(...performance.map(c => parseInt(c.orders) || 0)) : 1;

    if (loading) {
        return (
            <div className="performance-container">
                <div className="loading">Loading performance data...</div>
            </div>
        );
    }

    return (
        <div className="performance-container">
            <div className="performance-header">
                <h1>🏆 Cashier Performance Dashboard</h1>
                <div className="button-group">
                    <button className="nav-btn" onClick={() => navigate("/manager")}>← Back to Manager</button>
                    <button className="nav-btn" onClick={handleRefresh}>🔄 Refresh Data</button>
                    <button className="nav-btn" onClick={() => window.print()}>🖨️ Print Report</button>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card"><div className="kpi-info"><div className="kpi-value">{stats.totalCashiers}</div><div className="kpi-label">Active Cashiers</div></div></div>
                <div className="kpi-card"><div className="kpi-info"><div className="kpi-value">{stats.totalOrders}</div><div className="kpi-label">Total Orders</div></div></div>
                <div className="kpi-card"><div className="kpi-info"><div className="kpi-value">RM{stats.totalRevenue.toFixed(2)}</div><div className="kpi-label">Total Revenue</div></div></div>
                <div className="kpi-card"><div className="kpi-info"><div className="kpi-value">{stats.avgPerCashier}</div><div className="kpi-label">Avg Orders/Cashier</div></div></div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>📊 Orders by Cashier</h3>
                    <canvas ref={ordersChartRef} width="400" height="250"></canvas>
                </div>
                <div className="chart-card">
                    <h3>💰 Revenue by Cashier</h3>
                    <canvas ref={revenueChartRef} width="400" height="250"></canvas>
                </div>
            </div>

            <div className="leaderboard-section">
                <h3>🏅 Cashier Leaderboard</h3>
                <div className="table-container">
                    <table className="leaderboard-table">
                        <thead>
                            <tr><th>Rank</th><th>Cashier Name</th><th>Orders</th><th>Total Revenue</th><th>Avg Order</th><th>Performance</th></tr>
                        </thead>
                        <tbody>
                            {performance.map((cashier, index) => {
                                const orders = parseInt(cashier.orders) || 0;
                                const revenue = parseFloat(cashier.revenue) || 0;
                                const avgOrder = orders > 0 ? (revenue / orders).toFixed(2) : 0;
                                const percentage = maxOrders > 0 ? (orders / maxOrders) * 100 : 0;
                                
                                let medal = '';
                                let rankClass = '';
                                if (index === 0 && orders > 0) { medal = '🥇 '; rankClass = 'rank-1'; }
                                else if (index === 1 && orders > 0) { medal = '🥈 '; rankClass = 'rank-2'; }
                                else if (index === 2 && orders > 0) { medal = '🥉 '; rankClass = 'rank-3'; }
                                
                                return (
                                    <tr key={index} className={rankClass}>
                                        <td className="rank">{medal}#{index + 1}</td>
                                        <td className="cashier-name">{cashier.Name}</td>
                                        <td className="orders">{orders}</td>
                                        <td className="revenue">RM{revenue.toFixed(2)}</td>
                                        <td className="avg-order">RM{avgOrder}</td>
                                        <td className="performance-bar">
                                            {orders > 0 ? (
                                                <div className="bar-container">
                                                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                                                    <span className="bar-label">{percentage.toFixed(0)}%</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}