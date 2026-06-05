import { useState, useEffect } from "react";
import { getMenuWithSales } from "../api/api";

export function useTopSeller(menu) {
    const [topSeller, setTopSeller] = useState("Loading...");

    useEffect(() => {
        async function fetchTopSeller() {
            if (!menu || menu.length === 0) return;
            
            try {
                const menuWithSales = await getMenuWithSales();
                if (menuWithSales && menuWithSales.length > 0) {
                    const sorted = [...menuWithSales].sort((a, b) => b.TotalSold - a.TotalSold);
                    const top = sorted[0];
                    if (top && top.TotalSold > 0) {
                        setTopSeller(`${top.ItemName} (${top.TotalSold} sold)`);
                        return;
                    }
                }
                setTopSeller(`${menu[0]?.ItemName || "Coffee"} (0 sold)`);
            } catch (error) {
                console.error("Error fetching top seller:", error);
                setTopSeller(`${menu[0]?.ItemName || "Coffee"} (0 sold)`);
            }
        }
        
        fetchTopSeller();
    }, [menu]);

    return topSeller;
}