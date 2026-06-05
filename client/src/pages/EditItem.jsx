import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useModal } from "../hooks/useModal";
import { getAllMenu, updateMenuItem } from "../api/api";
import Modal from "../components/Modal";
import "../styles/global.css";
import "../styles/edit-item.css";

export default function EditItem() {
    const [searchParams] = useSearchParams();
    const itemId = searchParams.get("id");
    const navigate = useNavigate();
    const { modal, showModal, closeModal } = useModal();
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", category: "hot", price: "" });
    const [originalName, setOriginalName] = useState("");

    useEffect(() => {
        if (!itemId) {
            navigate("/manager");
            return;
        }
        loadItem();
    }, []);

    const loadItem = async () => {
        try {
            const items = await getAllMenu();
            const item = items.find(i => i.ItemID == itemId);
            if (!item) throw new Error("Item not found");
            setForm({ name: item.ItemName, category: item.Category || "hot", price: item.Price });
            setOriginalName(item.ItemName);
            setLoading(false);
        } catch (error) {
            showModal({ icon: "❌", title: "Error", message: error.message, confirmText: "OK", hideCancel: true, type: "danger", onConfirm: () => navigate("/manager") });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            showModal({ icon: "❌", title: "Error", message: "Please fill all fields", confirmText: "OK", hideCancel: true, type: "danger" });
            return;
        }
        try {
            await updateMenuItem(itemId, { name: form.name, category: form.category, price: parseFloat(form.price) });
            showModal({ icon: "✅", title: "Success", message: `"${form.name}" updated!`, confirmText: "OK", hideCancel: true, type: "success", onConfirm: () => navigate("/manager") });
        } catch (error) {
            showModal({ icon: "❌", title: "Error", message: error.message, confirmText: "OK", hideCancel: true, type: "danger" });
        }
    };

    if (loading) return <div className="edit-container"><div className="loading">Loading...</div></div>;

    return (
        <div className="edit-container">
            <button className="back-link" onClick={() => navigate("/manager")}>← Back to Manager Dashboard</button>
            <div className="edit-form">
                <h2>✏️ Edit Menu Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="item-id">Item ID: <span>{itemId}</span></div>
                    <div className="form-group"><label>Item Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="hot">🔥 Hot</option><option value="iced">❄️ Iced</option></select></div>
                    <div className="form-group"><label>Price (RM)</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                    <div className="button-group"><button type="submit" className="save-btn">💾 Save Changes</button><button type="button" className="cancel-btn" onClick={() => navigate("/manager")}>❌ Cancel</button></div>
                </form>
            </div>
            <Modal modal={modal} onClose={closeModal} />
        </div>
    );
}