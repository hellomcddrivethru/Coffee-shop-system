import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import { useModal } from "../hooks/useModal";
import Modal from "../components/Modal";
import "../styles/global.css";
import "../styles/users.css";

export default function Users() {
    const { users, loading, updateUser, deleteUser, reloadUsers } = useUsers();
    const { modal, showModal, closeModal } = useModal();
    const navigate = useNavigate();
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", role: "", password: "" });

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({ name: user.Name, role: user.Role, password: "" });
    };

    const handleSaveEdit = async () => {
        if (!editForm.name) {
            showModal({ icon: "❌", title: "Error", message: "Name required", confirmText: "OK", hideCancel: true, type: "danger" });
            return;
        }
        const data = { name: editForm.name, role: editForm.role };
        if (editForm.password) data.password = editForm.password;
        await updateUser(editingUser.EmployeeID, data);
        setEditingUser(null);
        setEditForm({ name: "", role: "", password: "" });
        await reloadUsers();
        showModal({ icon: "✅", title: "Success", message: "User updated", confirmText: "OK", hideCancel: true, type: "success" });
    };

    const handleDelete = (user) => {
        showModal({
            icon: "🗑️", title: "Delete User", message: `Delete "${user.Name}"?`, confirmText: "Yes", cancelText: "Cancel", type: "danger",
            onConfirm: async () => { await deleteUser(user.EmployeeID); await reloadUsers(); }
        });
    };

    if (loading) return <div className="users-container"><div className="loading">Loading users...</div></div>;

    return (
        <div className="users-container">
            <div className="users-header">
                <h1>👥 Manage Users</h1>
                <button className="back-btn" onClick={() => navigate("/manager")}>← Back</button>
            </div>
            {users.map(user => (
                <div key={user.EmployeeID} className="user-card">
                    <div className="user-info">
                        <div className="user-name">{user.Name}</div>
                        <div className="user-role">{user.Username} • {user.Role === 'manager' ? '👑 Manager' : '🛒 Cashier'}</div>
                    </div>
                    <div className="user-actions">
                        <button className="edit-user" onClick={() => handleEdit(user)}>✏️ Edit</button>
                        <button className="delete-user" onClick={() => handleDelete(user)}>🗑️ Delete</button>
                    </div>
                </div>
            ))}
            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h3>✏️ Edit User</h3></div>
                        <div className="modal-body">
                            <input type="text" placeholder="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                            </select>
                            <input type="password" placeholder="New password (leave blank to keep current)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                            <button className="modal-btn modal-btn-confirm" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            <Modal modal={modal} onClose={closeModal} />
        </div>
    );
}