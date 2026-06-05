import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import POS from "./pages/POS";
import OrderHistory from "./pages/OrderHistory";
import Manager from "./pages/Manager";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import EditItem from "./pages/EditItem";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/users" element={<Users />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/edit-item" element={<EditItem />} />
        </Routes>
    );
}