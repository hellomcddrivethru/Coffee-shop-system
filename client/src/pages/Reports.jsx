import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReports } from "../hooks/useReports";
import "../styles/global.css";
import "../styles/reports.css";

export default function Reports() {
    const navigate = useNavigate();
    const { fetchTopItems, fetchSalesStats } = useReports();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [limit, setLimit] = useState(10);
    const [stats, setStats] = useState(null);
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        let start = startDate;
        let end = endDate;
        if (!start || !end) {
            const endD = new Date();
            const startD = new Date();
            startD.setDate(startD.getDate() - 30);
            start = startD.toISOString().split('T')[0];
            end = endD.toISOString().split('T')[0];
            setStartDate(start);
            setEndDate(end);
        }
        setLoading(true);
        const statsData = await fetchSalesStats(start, end);
        const itemsData = await fetchTopItems(start, end, limit);
        setStats(statsData);
        setTopItems(itemsData);
        setLoading(false);
    };

    const totalSold = topItems.reduce((s, i) => s + (parseInt(i.TotalSold) || 0), 0);

    return (
        <div className="reports-container">
            <div className="report-header no-print">
                <h1>📊 Sales Reports & Analytics</h1>
                <button className="back-btn" onClick={() => navigate("/manager")}>← Back</button>
            </div>
            <div className="date-range no-print">
                <div className="date-group"><label>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="date-group"><label>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                <div className="date-group"><label>Show Top</label><select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))}><option value={5}>Top 5 Items</option><option value={10}>Top 10 Items</option><option value={15}>Top 15 Items</option></select></div>
                <button className="generate-btn" onClick={generateReport}>📈 Generate Report</button>
                <button className="print-btn" onClick={() => window.print()}>🖨️ Print Report</button>
            </div>
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-value">{stats.totalOrders}</div><div className="stat-label">Total Orders</div></div>
                    <div className="stat-card"><div className="stat-value">RM{stats.totalRevenue.toFixed(2)}</div><div className="stat-label">Total Revenue</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.totalItems}</div><div className="stat-label">Total Items Sold</div></div>
                    <div className="stat-card"><div className="stat-value">RM{stats.avgOrder.toFixed(2)}</div><div className="stat-label">Average Order Value</div></div>
                </div>
            )}
            <div className="top-items-section">
                <h2>🏆 Top Selling Items</h2>
                {loading ? <div className="loading">Loading...</div> : topItems.length > 0 ? (
                    <>
                        <table className="items-table">
                            <thead><tr><th>Rank</th><th>Item Name</th><th>Category</th><th>Price</th><th>Quantity Sold</th><th>Revenue</th><th>% of Sales</th></tr></thead>
                            <tbody>
                                {topItems.map((item, i) => {
                                    const sold = parseInt(item.TotalSold) || 0;
                                    const percentage = totalSold > 0 ? ((sold / totalSold) * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={i} className={i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}>
                                            <td><strong>#{i+1}</strong> {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</td>
                                            <td><strong>{item.ItemName}</strong></td>
                                            <td>{item.Category === 'hot' ? '🔥 Hot' : '❄️ Iced'}</td>
                                            <td>RM{parseFloat(item.Price).toFixed(2)}</td>
                                            <td><strong>{sold}</strong></td>
                                            <td>RM{parseFloat(item.TotalRevenue).toFixed(2)}</td>
                                            <td>{percentage}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="total-sold">📊 Total Items Sold: {totalSold} | 💰 Total Revenue: RM{topItems.reduce((s, i) => s + parseFloat(i.TotalRevenue), 0).toFixed(2)}</div>
                    </>
                ) : <div className="loading">Select dates and click Generate Report</div>}
            </div>
        </div>
    );
}