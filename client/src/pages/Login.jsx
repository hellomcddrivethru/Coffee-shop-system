import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function Login() {
    const { role } = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter username and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const loginFn = role === "cashier" ? api.loginCashier : api.loginManager;
            const data = await loginFn({ username, password });

            console.log("Login response:", data);

            if (data.success && data.user) {
                sessionStorage.setItem("user", JSON.stringify(data.user));
                
                // Redirect based on role
                if (data.user.Role === "manager") {
                    console.log("Redirecting to /manager");
                    navigate("/manager");
                } else if (data.user.Role === "cashier") {
                    console.log("Redirecting to /pos");
                    navigate("/pos");
                } else {
                    setError("Unknown role");
                }
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#4b672f", padding: "2rem" }}>
            <div style={{ background: "#d8af81", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "400px", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>☕</div>
                <h1 style={{ color: "#2c1810", marginBottom: "1.5rem" }}>{role?.charAt(0).toUpperCase() + role?.slice(1)} Login</h1>
                
                {error && <div style={{ background: "#dc3545", color: "white", padding: "0.5rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}
                
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#2c1810" }}>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        style={{ width: "100%", padding: "0.75rem", border: "2px solid #4b672f", borderRadius: "8px", fontSize: "1rem" }} 
                    />
                </div>
                
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#2c1810" }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()} 
                        style={{ width: "100%", padding: "0.75rem", border: "2px solid #4b672f", borderRadius: "8px", fontSize: "1rem" }} 
                    />
                </div>
                
                <button 
                    onClick={handleLogin} 
                    disabled={loading}
                    style={{ width: "100%", background: "#4b672f", color: "white", border: "none", padding: "0.75rem", borderRadius: "8px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", marginTop: "1rem", opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                <button onClick={() => navigate("/")} style={{ display: "block", width: "100%", marginTop: "1rem", background: "transparent", border: "none", color: "#2c1810", cursor: "pointer" }}>← Back to Homepage</button>
            </div>
        </div>
    );
}