import { useState } from "react";
import { getTopItems, getSalesStats, getOrdersWithEmployees } from "../api/api";

export function useReports() {
    const [loading, setLoading] = useState(false);

    const fetchTopItems = async (startDate, endDate, limit = 10) => {
        setLoading(true);
        try {
            const data = await getTopItems(startDate, endDate, limit);
            return data || [];
        } catch (error) {
            console.error("Error fetching top items:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesStats = async (startDate, endDate) => {
        setLoading(true);
        try {
            const data = await getSalesStats(startDate, endDate);
            return data || { totalOrders: 0, totalRevenue: 0, avgOrder: 0, totalItems: 0 };
        } catch (error) {
            console.error("Error fetching sales stats:", error);
            return { totalOrders: 0, totalRevenue: 0, avgOrder: 0, totalItems: 0 };
        } finally {
            setLoading(false);
        }
    };

    const fetchPerformance = async (startDate, endDate) => {
        setLoading(true);
        try {
            const data = await getOrdersWithEmployees(startDate, endDate);
            return data || [];
        } catch (error) {
            console.error("Error fetching performance:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return { loading, fetchTopItems, fetchSalesStats, fetchPerformance };
}