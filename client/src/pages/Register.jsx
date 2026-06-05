import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cashier");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async () => {
        if (!name || !username || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const data = await api.register({ name, username, password, role });
            if (data.success) {
                setSuccess("Registration successful! Redirecting...");
                setTimeout(() => navigate(role === "manager" ? "/login/manager" : "/login/cashier"), 2000);
            } else {
                setError(data.error || "Registration failed");
            }
        } catch {
            setError("Server error. Please try again.");
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#4b672f", padding: "2rem" }}>
            <div style={{ background: "#d8af81", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "400px", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>☕</div>
                <h1 style={{ color: "#2c1810", marginBottom: "1.5rem" }}>Register New User</h1>
                
                {error && <div style={{ background: "#dc3545", color: "white", padding: "0.5rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}
                {success && <div style={{ background: "#4b672f", color: "white", padding: "0.5rem", borderRadius: "8px", marginBottom: "1rem" }}>{success}</div>}
                
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#2c1810" }}>Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #4b672f", borderRadius: "8px", fontSize: "1rem" }} />
                </div>
                
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#2c1810" }}>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #4b672f", borderRadius: "8px", fontSize: "1rem" }} />
                </div>
                
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#2c1810" }}>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #4b672f", borderRadius: "8px", fontSize: "1rem" }} />
                </div>
                
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#2c1810" }}>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "2px solid #4b672f", borderRadius: "8px", fontSize: "1rem" }}>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                
                <button onClick={handleRegister} style={{ width: "100%", background: "#4b672f", color: "white", border: "none", padding: "0.75rem", borderRadius: "8px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", marginTop: "1rem" }}>Sign Up!</button>
                <button onClick={() => navigate("/")} style={{ display: "block", width: "100%", marginTop: "1rem", background: "transparent", border: "none", color: "#2c1810", cursor: "pointer" }}>← Back to Homepage</button>
            </div>
        </div>
    );
}