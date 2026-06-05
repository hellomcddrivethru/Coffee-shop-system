/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        console.log("useAuth - storedUser:", storedUser);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user:", e);
                sessionStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
    };

    return { user, loading, logout };
}