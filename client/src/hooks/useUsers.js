/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser } from "../api/api";

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleUpdateUser = async (id, data) => {
        const result = await updateUser(id, data);
        if (result.success) await loadUsers();
        return result;
    };

    const handleDeleteUser = async (id) => {
        const result = await deleteUser(id);
        if (result.success) await loadUsers();
        return result;
    };

    return { users, loading, reloadUsers: loadUsers, updateUser: handleUpdateUser, deleteUser: handleDeleteUser };
}