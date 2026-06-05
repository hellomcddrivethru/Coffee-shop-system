const BASE_URL = "http://localhost:5000/api";

async function request(url, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${url}`, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${res.status}`);
        }
        
        return await res.json();
    } catch (error) {
        console.error(`API Error (${url}):`, error);
        throw error;
    }
}

// ========== AUTH ==========
export const loginCashier = (data) => request("/auth/login/cashier", { method: "POST", body: JSON.stringify(data) });
export const loginManager = (data) => request("/auth/login/manager", { method: "POST", body: JSON.stringify(data) });
export const register = (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) });

// ========== MENU ==========
export const getMenu = () => request("/menu");
export const getAllMenu = () => request("/menu/all");
export const addMenuItem = (data) => request("/menu", { method: "POST", body: JSON.stringify(data) });
export const updateMenuItem = (id, data) => request(`/menu/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMenuItem = (id) => request(`/menu/${id}`, { method: "DELETE" });
export const disableMenuItem = (id) => request(`/menu/${id}/disable`, { method: "PUT" });
export const enableMenuItem = (id) => request(`/menu/${id}/enable`, { method: "PUT" });

// ========== ORDERS ==========
export const createOrder = (data) => request("/orders/checkout", { method: "POST", body: JSON.stringify(data) });
export const getOrders = () => request("/orders/orders");
export const getOrderById = (id) => request(`/orders/orders/${id}`);
export const deleteOrder = (id) => request(`/orders/orders/${id}`, { method: "DELETE" });
export const updatePayment = (id, data) => request(`/orders/orders/${id}/payment`, { method: "PUT", body: JSON.stringify(data) });

// ========== REPORTS ==========
export const getMenuWithSales = () => request("/reports/menu-with-sales");
export const getTopItems = (startDate, endDate, limit = 10) => {
    let url = `/reports/top-items?limit=${limit}`;
    if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return request(url);
};
export const getSalesStats = (startDate, endDate) => {
    let url = `/reports/sales-stats`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return request(url);
};
export const getOrdersWithEmployees = (startDate, endDate) => {
    let url = `/reports/orders-with-employees`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return request(url);
};

// ========== USERS ==========
export const getUsers = () => request("/users/users");
export const updateUser = (id, data) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUser = (id) => request(`/users/${id}`, { method: "DELETE" });

// ========== SINGLE API EXPORT ==========
export const api = { 
    loginCashier, loginManager, register,
    getMenu, getAllMenu, addMenuItem, updateMenuItem, deleteMenuItem, disableMenuItem, enableMenuItem,
    createOrder, getOrders, getOrderById, deleteOrder, updatePayment,
    getMenuWithSales, getTopItems, getSalesStats, getOrdersWithEmployees,
    getUsers, updateUser, deleteUser
};