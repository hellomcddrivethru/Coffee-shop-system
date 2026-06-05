/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useModal } from "../hooks/useModal";
import { getAllMenu, addMenuItem, updateMenuItem, deleteMenuItem, disableMenuItem, enableMenuItem } from "../api/api";
import Modal from "../components/Modal";
import "../styles/global.css";
import "../styles/manager.css";

export default function Manager() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { modal, showModal, closeModal } = useModal();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [newItem, setNewItem] = useState({ name: "", category: "hot", price: "" });
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", category: "hot", price: "" });

    // Check authentication
    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/");
            return;
        }
        if (user && user.Role !== "manager") {
            navigate("/pos");
            return;
        }
        if (user) {
            loadItems();
        }
    }, [user, authLoading]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await getAllMenu();
            setItems(data);
        } catch (error) {
            console.error("Error loading items:", error);
        } finally {
            setLoading(false);
        }
    };

    // ============ ADD NEW ITEM ============
    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price) {
            showModal({ 
                icon: "❌", 
                title: "Error", 
                message: "Please fill in all fields correctly", 
                confirmText: "OK", 
                hideCancel: true, 
                type: "danger" 
            });
            return;
        }

        try {
            await addMenuItem({ 
                name: newItem.name, 
                category: newItem.category, 
                price: parseFloat(newItem.price) 
            });
            setNewItem({ name: "", category: "hot", price: "" });
            await loadItems();
            showModal({ 
                icon: "✅", 
                title: "Item Added", 
                message: `"${newItem.name}" has been added to the menu!`, 
                confirmText: "OK", 
                hideCancel: true, 
                type: "success" 
            });
        } catch (error) {
            showModal({ 
                icon: "❌", 
                title: "Error", 
                message: error.message, 
                confirmText: "OK", 
                hideCancel: true, 
                type: "danger" 
            });
        }
    };

    // ============ EDIT ITEM ============
    const openEditModal = (item) => {
        setEditingItem(item);
        setEditForm({
            name: item.ItemName,
            category: item.Category || "hot",
            price: item.Price
        });
    };

    const handleEditItem = async () => {
        if (!editForm.name || !editForm.price) {
            showModal({ 
                icon: "❌", 
                title: "Error", 
                message: "Please fill in all fields correctly", 
                confirmText: "OK", 
                hideCancel: true, 
                type: "danger" 
            });
            return;
        }

        try {
            await updateMenuItem(editingItem.ItemID, { 
                name: editForm.name, 
                category: editForm.category, 
                price: parseFloat(editForm.price) 
            });
            setEditingItem(null);
            await loadItems();
            showModal({ 
                icon: "✅", 
                title: "Item Updated", 
                message: `"${editForm.name}" has been updated successfully!`, 
                confirmText: "OK", 
                hideCancel: true, 
                type: "success" 
            });
        } catch (error) {
            showModal({ 
                icon: "❌", 
                title: "Error", 
                message: error.message, 
                confirmText: "OK", 
                hideCancel: true, 
                type: "danger" 
            });
        }
    };

    // ============ TOGGLE ITEM STATUS (DISABLE/ENABLE) ============
    const handleToggleStatus = (item) => {
        const isDisabling = item.IsAvailable === 1;
        const actionText = isDisabling ? "disable" : "enable";
        
        showModal({
            icon: isDisabling ? "🔴" : "🟢",
            title: `${isDisabling ? "Disable" : "Enable"} Menu Item`,
            message: `Are you sure you want to ${actionText} this item?${isDisabling ? " It will be hidden from the POS menu." : " It will appear in the POS menu again."}`,
            confirmText: `Yes, ${actionText}`,
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    if (isDisabling) {
                        await disableMenuItem(item.ItemID);
                    } else {
                        await enableMenuItem(item.ItemID);
                    }
                    await loadItems();
                    showModal({ 
                        icon: "✅", 
                        title: "Success", 
                        message: `Item has been ${actionText}d successfully!`, 
                        confirmText: "OK", 
                        hideCancel: true, 
                        type: "success" 
                    });
                } catch (error) {
                    showModal({ 
                        icon: "❌", 
                        title: "Error", 
                        message: error.message, 
                        confirmText: "OK", 
                        hideCancel: true, 
                        type: "danger" 
                    });
                }
            }
        });
    };

    // ============ DELETE ITEM ============
    const handleDeleteItem = (item) => {
        showModal({
            icon: "🗑️",
            title: "Delete Menu Item",
            message: `Are you sure you want to delete "${item.ItemName}"? This action cannot be undone.`,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    await deleteMenuItem(item.ItemID);
                    await loadItems();
                    showModal({ 
                        icon: "✅", 
                        title: "Item Deleted", 
                        message: `"${item.ItemName}" has been deleted from the menu!`, 
                        confirmText: "OK", 
                        hideCancel: true, 
                        type: "success" 
                    });
                } catch (error) {
                    showModal({ 
                        icon: "❌", 
                        title: "Error", 
                        message: error.message, 
                        confirmText: "OK", 
                        hideCancel: true, 
                        type: "danger" 
                    });
                }
            }
        });
    };

    const handleLogout = () => {
        showModal({
            icon: "🚪",
            title: "Logout",
            message: "Are you sure you want to logout?",
            confirmText: "Yes",
            cancelText: "Cancel",
            onConfirm: () => {
                sessionStorage.clear();
                navigate("/");
            }
        });
    };

    // Filter items based on search
    const filteredItems = items.filter(item =>
        item.ItemName.toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="manager-container">
                <div className="loading">Loading menu items...</div>
            </div>
        );
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <h1>☕ Manager Dashboard</h1>
                <div className="button-group">
                    <button className="nav-btn" onClick={() => navigate("/order-history")}>Order History</button>
                    <button className="nav-btn" onClick={() => navigate("/users")}>Manage Users</button>
                    <button className="nav-btn" onClick={() => navigate("/dashboard")}>Dashboard Analytics</button>
                    <button className="nav-btn" onClick={() => navigate("/performance")}>Cashier Performance</button>
                    <button className="nav-btn logout-btn" onClick={handleLogout}>← Logout</button>
                </div>
            </div>

            {/* Add New Item Form */}
            <div className="manager-form">
                <h2>➕ Add New Item</h2>
                <input 
                    type="text" 
                    placeholder="Item Name (e.g., ICED LATTE)" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <select 
                    value={newItem.category} 
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                    <option value="hot">🔥 Hot</option>
                    <option value="iced">❄️ Iced</option>
                </select>
                <input 
                    type="number" 
                    placeholder="Price (RM)" 
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
                <button className="add-btn" onClick={handleAddItem}>+ Add Item</button>
            </div>

            {/* Manage Menu Items */}
            <div className="manager-form">
                <h2>📋 Manage Menu Items</h2>
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="🔍 Search items..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="menu-items-list">
                    {filteredItems.length === 0 ? (
                        <div className="empty-state">📭 No menu items found</div>
                    ) : (
                        filteredItems.map(item => (
                            <div key={item.ItemID} className={`menu-item-card ${item.IsAvailable === 0 ? 'disabled-item' : ''}`}>
                                <div className="menu-item-info">
                                    <div className="menu-item-name">
                                        {item.ItemName}
                                        {item.IsAvailable === 0 && <span className="badge-disabled">(DISABLED)</span>}
                                    </div>
                                    <div className="menu-item-details">
                                        {item.Category === 'hot' ? '🔥' : '❄️'} {item.Category || 'hot'} | 
                                        Price: <span className="menu-item-price">RM{parseFloat(item.Price).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="menu-item-actions">
                                    <button className="edit-btn" onClick={() => openEditModal(item)}>✏️ Edit</button>
                                    {item.IsAvailable === 1 ? (
                                        <button className="disable-btn" onClick={() => handleToggleStatus(item)}>🔴 Disable</button>
                                    ) : (
                                        <button className="enable-btn" onClick={() => handleToggleStatus(item)}>🟢 Enable</button>
                                    )}
                                    <button className="delete-btn" onClick={() => handleDeleteItem(item)}>🗑️ Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Item Modal */}
            {editingItem && (
                <div className="modal-overlay" onClick={() => setEditingItem(null)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon">✏️</div>
                            <h3>Edit Menu Item</h3>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Item Name</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: "100%", padding: "8px", border: "2px solid #4b672f", borderRadius: "8px" }}
                                />
                            </div>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Category</label>
                                <select 
                                    value={editForm.category} 
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    style={{ width: "100%", padding: "8px", border: "2px solid #4b672f", borderRadius: "8px" }}
                                >
                                    <option value="hot">🔥 Hot</option>
                                    <option value="iced">❄️ Iced</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Price (RM)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={editForm.price} 
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    style={{ width: "100%", padding: "8px", border: "2px solid #4b672f", borderRadius: "8px" }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-cancel" onClick={() => setEditingItem(null)}>Cancel</button>
                            <button className="modal-btn modal-btn-confirm" onClick={handleEditItem}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <Modal modal={modal} onClose={closeModal} />
        </div>
    );
}