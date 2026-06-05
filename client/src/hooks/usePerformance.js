import { useState, useEffect } from "react";
import { getOrdersWithEmployees } from "../api/api";

export function usePerformance(period = "week") {
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalCashiers: 0, totalOrders: 0, totalRevenue: 0, avgPerCashier: 0 });

    const getDateRange = () => {
        const now = new Date();
        let start = new Date();
        switch(period) {
            case "week": start.setDate(now.getDate() - 7); break;
            case "month": start.setMonth(now.getMonth() - 1); break;
            case "year": start.setFullYear(now.getFullYear() - 1); break;
            default: start.setDate(now.getDate() - 7);
        }
        return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
    };

    const loadPerformance = async () => {
        setLoading(true);
        try {
            const { start, end } = getDateRange();
            const data = await getOrdersWithEmployees(start, end);
            setPerformance(data);
            const totalCashiers = data.filter(c => c.orders > 0).length;
            const totalOrders = data.reduce((s, c) => s + (parseInt(c.orders) || 0), 0);
            const totalRevenue = data.reduce((s, c) => s + (parseFloat(c.revenue) || 0), 0);
            setStats({ totalCashiers, totalOrders, totalRevenue, avgPerCashier: totalCashiers > 0 ? (totalOrders / totalCashiers).toFixed(1) : 0 });
        } catch (error) {
            console.error("Error loading performance:", error);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadPerformance(); }, [period]);

    return { performance, loading, stats, reloadPerformance: loadPerformance };
}