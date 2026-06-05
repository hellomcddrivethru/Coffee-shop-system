import { useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ 
            minHeight: "100vh", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            background: "#4b672f",
            padding: "2rem"
        }}>
            <div style={{ textAlign: "center", maxWidth: "500px", width: "100%" }}>
                <img src="/coffee.png" alt="Coffee cup" style={{ width: "120px", marginBottom: "2rem" }} />
                <h1 style={{ color: "white", fontSize: "3rem", marginBottom: "1rem" }}>Insaynitea Coffee</h1>
                
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1rem",
                    background: "#d8af81",
                    padding: "2rem",
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}>
                    <button onClick={() => navigate("/login/cashier")} style={{ background: "#4b672f", color: "white", padding: "1rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "600", cursor: "pointer", border: "none" }}>
                        Log in as Cashier
                    </button>
                    <button onClick={() => navigate("/login/manager")} style={{ background: "#4b672f", color: "white", padding: "1rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "600", cursor: "pointer", border: "none" }}>
                        Log in as Manager
                    </button>
                    <button onClick={() => navigate("/register")} style={{ background: "#4b672f", color: "white", padding: "1rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "600", cursor: "pointer", border: "none" }}>
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}