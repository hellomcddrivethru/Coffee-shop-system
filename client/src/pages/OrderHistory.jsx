import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, getOrderById, deleteOrder } from "../api/api";
import { useModal } from "../hooks/useModal";
import { printReceipt } from "../utils/receipt";
import Modal from "../components/Modal";
import "../styles/order-history.css";

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { modal, showModal, closeModal } = useModal();
    const navigate = useNavigate();

    // Get user role for back button (smart back)
    const user = JSON.parse(sessionStorage.getItem("user") || '{}');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setAllOrders(data);
            filterAndDisplay(data, "");
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndDisplay = (ordersData, searchTerm) => {
        let filtered = ordersData;
        if (searchTerm) {
            filtered = ordersData.filter(order => 
                order.OrderID.toString().includes(searchTerm)
            );
        }
        setOrders(filtered);
    };

    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterAndDisplay(allOrders, searchTerm);
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const data = await getOrderById(orderId);
            setSelectedOrder(data);
        } catch (error) {
            showModal({
                icon: "❌",
                title: "Error",
                message: "Failed to load order details",
                confirmText: "OK",
                hideCancel: true,
                type: "danger"
            });
        }
    };

    const closeDetailsModal = () => {
        setSelectedOrder(null);
    };

    const handleReprint = async (orderId) => {
        try {
            const data = await getOrderById(orderId);
            const items = data.items.map(item => ({
                name: item.ItemName,
                quantity: item.Quantity,
                price: item.Subtotal / item.Quantity
            }));
            const total = parseFloat(data.order.TotalAmount);
            printReceipt(orderId, items, total);
        } catch (error) {
            showModal({
                icon: "❌",
                title: "Error",
                message: "Failed to reprint receipt",
                confirmText: "OK",
                hideCancel: true,
                type: "danger"
            });
        }
    };

    const handleDelete = (orderId) => {
        showModal({
            icon: "🗑️",
            title: "Delete Order",
            message: `Are you sure you want to delete Order #${orderId}? This action cannot be undone.`,
            confirmText: "Yes, Delete Order",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    await deleteOrder(orderId);
                    await loadOrders();
                    showModal({
                        icon: "✅",
                        title: "Order Deleted",
                        message: `Order #${orderId} has been deleted successfully!`,
                        confirmText: "OK",
                        hideCancel: true,
                        type: "success"
                    });
                } catch (error) {
                    showModal({
                        icon: "❌",
                        title: "Error",
                        message: "Failed to delete order",
                        confirmText: "OK",
                        hideCancel: true,
                        type: "danger"
                    });
                }
            }
        });
    };

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.TotalAmount), 0);

    if (loading) {
        return (
            <div className="history-container">
                <div className="loading">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>📋 Order History</h1>
                <div className="header-buttons">
                    <button className="refresh-btn" onClick={loadOrders}>🔄 Refresh</button>
                    {user.Role === 'manager' ? (
                        <button className="back-btn" onClick={() => navigate("/manager")}>← Back to Manager Dashboard</button>
                    ) : (
                        <button className="back-btn" onClick={() => navigate("/pos")}>← Back to POS</button>
                    )}
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input 
                        type="text" 
                        id="search-order" 
                        placeholder="🔍 Search by Order ID..." 
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="stats-summary">
                <div className="stat-card">
                    <div className="stat-value">{totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">RM{totalRevenue.toFixed(2)}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>

            <div className="orders-list" id="orders-list">
                {orders.length === 0 ? (
                    <div className="empty-state">📭 No orders found</div>
                ) : (
                    orders.map(order => (
                        <div className="order-card" key={order.OrderID}>
                            <div className="order-info">
                                <div className="order-id">Order #{order.OrderID}</div>
                                <div className="order-date">{new Date(order.OrderDate).toLocaleString()}</div>
                                <div>{order.ItemCount || 0} item(s)</div>
                            </div>
                            <div className="order-total">RM{parseFloat(order.TotalAmount).toFixed(2)}</div>
                            <div className="order-actions">
                                <button className="view-details-btn" onClick={() => viewOrderDetails(order.OrderID)}>👁️ View</button>
                                <button className="print-receipt-btn" onClick={() => handleReprint(order.OrderID)}>🧾 Reprint</button>
                                <button className="delete-order-btn" onClick={() => handleDelete(order.OrderID)}>🗑️ Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div id="order-modal" className="modal active" onClick={closeDetailsModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #d8af81" }}>
                            <h3>📋 Order Details</h3>
                            <button onClick={closeDetailsModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
                        </div>
                        <div style={{ padding: "1rem" }}>
                            <p><strong>Order ID:</strong> #{selectedOrder.order.OrderID}</p>
                            <p><strong>Date:</strong> {new Date(selectedOrder.order.OrderDate).toLocaleString()}</p>
                            <p><strong>Total:</strong> RM{parseFloat(selectedOrder.order.TotalAmount).toFixed(2)}</p>
                            <hr style={{ margin: "0.5rem 0", borderColor: "#d8af81" }} />
                            <h4>Items:</h4>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                                    <span>{item.ItemName}</span>
                                    <span>{item.Quantity} x RM{(item.Subtotal / item.Quantity).toFixed(2)} = RM{parseFloat(item.Subtotal).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: "1rem", padding: "0.5rem", background: "rgba(75, 103, 47, 0.1)", borderRadius: "8px", fontWeight: "bold", textAlign: "right" }}>
                                Total: RM{parseFloat(selectedOrder.order.TotalAmount).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal modal={modal} onClose={closeModal} />
        </div>
    );
}