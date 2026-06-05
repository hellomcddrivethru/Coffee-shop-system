import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMenuWithSales } from "../api/api";

export default function OrderSidebar({ order, total, onQty, onRemove, onCheckout, menu }) {
    const navigate = useNavigate();
    const [topSeller, setTopSeller] = useState("Loading...");

    // Fetch fresh menu with sales data for accurate top seller
    const fetchTopSeller = async () => {
        try {
            const data = await getMenuWithSales();
            console.log("Menu with sales for top seller:", data);
            
            if (!data || data.length === 0) {
                setTopSeller("No sales yet");
                return;
            }
            
            // Find the item with highest TotalSold
            const sorted = [...data].sort((a, b) => (b.TotalSold || 0) - (a.TotalSold || 0));
            const top = sorted[0];
            
            console.log("Top seller:", top);
            
            if (top && top.TotalSold > 0) {
                setTopSeller(`${top.ItemName} (${top.TotalSold} sold)`);
            } else {
                setTopSeller("No sales yet");
            }
        } catch (error) {
            console.error("Error fetching top seller:", error);
            setTopSeller("Unable to load");
        }
    };

    useEffect(() => {
        fetchTopSeller();
    }, [menu]); // Re-fetch when menu changes

    return (
        <div className="order-sidebar">
            <h2>Your Order</h2>

            <div className="order-items">
                {order.length === 0 ? (
                    <p className="empty-message">No items added yet</p>
                ) : (
                    order.map((item) => (
                        <div className="order-item" key={item.name}>
                            <div style={{ flex: 1 }}>
                                <span className="order-item-name">{item.name}</span>
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                                    <button className="qty-btn" onClick={() => onQty(item.name, -1)}>-</button>
                                    <span className="order-item-quantity">{item.quantity}</span>
                                    <button className="qty-btn" onClick={() => onQty(item.name, 1)}>+</button>
                                </div>
                            </div>
                            <div>
                                <span className="order-item-price">RM{(item.price * item.quantity).toFixed(2)}</span>
                                <button className="remove-item" onClick={() => onRemove(item.name)}>✕</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="order-total">
                <span>Total:</span>
                <span>RM{total.toFixed(2)}</span>
            </div>

            <button className="checkout-btn" onClick={onCheckout}>Checkout</button>

            <div className="top-seller-section">
                <div className="top-seller-header">🏆 Today's Top Seller</div>
                <div className="top-seller-display">
                    <span className="top-seller-icon">☕</span>
                    <span className="top-seller-name">{topSeller}</span>
                </div>
            </div>

            {/* Order History Button */}
            <button className="order-history-btn" onClick={() => navigate("/order-history")}>
                Order History
            </button>
        </div>
    );
}