import { useState, useEffect } from "react";
import { getMenuWithSales } from "../api/api";

export function useMenu() {
    const [menu, setMenu] = useState([]);
    const [category, setCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    const loadMenu = async () => {
        setLoading(true);
        try {
            const data = await getMenuWithSales();
            console.log("Menu with sales:", data);
            
            const formattedData = data.map(item => ({
                ...item,
                Price: parseFloat(item.Price),
                TotalSold: Number(item.TotalSold) || 0
            }));
            
            setMenu(formattedData);
        } catch (error) {
            console.error("Error loading menu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenu();
    }, []);

    const filtered = category === "all"
        ? menu
        : menu.filter(i => i.Category?.toLowerCase() === category);

    return { menu: filtered, category, setCategory, loading, reloadMenu: loadMenu };
}