import { useState, useEffect } from "react";
import { getMenuWithSales } from "../api/api";

export default function TopSeller() {
    const [topSeller, setTopSeller] = useState("Loading...");

    useEffect(() => {
        const loadTopSeller = async () => {
            try {
                const data = await getMenuWithSales();
                if (data && data.length > 0) {
                    const sorted = [...data].sort((a, b) => b.TotalSold - a.TotalSold);
                    const top = sorted[0];
                    if (top && top.TotalSold > 0) {
                        setTopSeller(`${top.ItemName} (${top.TotalSold} sold)`);
                        return;
                    }
                }
                setTopSeller("No sales yet");
            } catch (error) {
                console.error("Error loading top seller:", error);
                setTopSeller("Unable to load");
            }
        };
        loadTopSeller();
    }, []);

    return (
        <div className="top-seller-section">
            <div className="top-seller-header">🏆 Today's Top Seller</div>
            <div className="top-seller-display">
                <span className="top-seller-icon">☕</span>
                <span className="top-seller-name">{topSeller}</span>
            </div>
        </div>
    );
}