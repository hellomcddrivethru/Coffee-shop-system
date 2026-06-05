import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../hooks/useMenu";
import { useOrder } from "../hooks/useOrder";
import { useModal } from "../hooks/useModal";
import MenuGrid from "../components/MenuGrid";
import OrderSidebar from "../components/OrderSidebar";
import CategoryFilter from "../components/CategoryFilter";
import Modal from "../components/Modal";
import PaymentModal from "../components/PaymentModal";
import { createOrder, updatePayment } from "../api/api";
import { printReceipt } from "../utils/receipt";
import "../styles/global.css";
import "../styles/pos.css";

export default function POS() {
    const { menu, setCategory, category, reloadMenu } = useMenu();
    const { order, addItem, updateQty, removeItem, clearOrder, total } = useOrder();
    const { modal, showModal, closeModal } = useModal();
    const [showPayment, setShowPayment] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);
    const user = JSON.parse(sessionStorage.getItem("user") || '{"Name":"Cashier"}');

    const handleLogout = () => {
        showModal({
            icon: "🚪", title: "Logout", message: "Are you sure you want to logout?",
            confirmText: "Yes", cancelText: "Cancel",
            onConfirm: () => { sessionStorage.clear(); window.location.href = "/"; }
        });
    };

    const handleCheckout = async () => {
        if (order.length === 0) {
            showModal({ icon: "🛒", title: "Empty Order", message: "Please add items to your order first", confirmText: "OK", hideCancel: true, type: "danger" });
            return;
        }

        const itemsForApi = [];
        order.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                itemsForApi.push({ name: item.name, price: item.price });
            }
        });

        try {
            const result = await createOrder({ items: itemsForApi, total, employeeId: user?.EmployeeID || null });
            setPendingOrderId(result.orderId);
            setShowPayment(true);
        } catch (error) {
            showModal({ icon: "❌", title: "Error", message: `Checkout failed: ${error.message}`, confirmText: "OK", hideCancel: true, type: "danger" });
        }
    };

    const handlePaymentConfirm = async (method) => {
        setShowPayment(false);
        try {
            await updatePayment(pendingOrderId, { paymentMethod: method, paymentStatus: 'completed' });
            printReceipt(pendingOrderId, order, total);
            showModal({ icon: method === 'qr' ? '📱' : '💵', title: "Payment Successful!", message: `Order #${pendingOrderId}\nPayment: ${method.toUpperCase()}\nTotal: RM${total.toFixed(2)}`, confirmText: "OK", hideCancel: true, type: "success", onConfirm: () => { clearOrder(); reloadMenu(); } });
        } catch (error) {
            showModal({ icon: "❌", title: "Payment Failed", message: error.message, confirmText: "OK", hideCancel: true, type: "danger" });
        }
    };

    return (
        <div className="menu-container">
            <div className="top-bar">
                <span>Welcome, <b>{user?.Name || "Cashier"}</b></span>
                <button className="logout-btn" onClick={handleLogout}>← Logout</button>
            </div>

            <header><h1>WELCOME!</h1></header>
            <CategoryFilter category={category} onChange={setCategory} />
            <MenuGrid menu={menu} onAdd={addItem} />
            <OrderSidebar order={order} total={total} onQty={updateQty} onRemove={removeItem} onCheckout={handleCheckout} menu={menu} />

            <Modal modal={modal} onClose={closeModal} />
            {showPayment && <PaymentModal total={total} onConfirm={handlePaymentConfirm} onClose={() => setShowPayment(false)} />}
        </div>
    );
}