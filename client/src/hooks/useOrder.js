import { useState } from "react";

export function useOrder() {
    const [order, setOrder] = useState([]);

    function addItem(item) {
        setOrder(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i =>
                    i.name === item.name
                        ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.price }
                        : i
                );
            }
            return [...prev, { ...item, quantity: 1, totalPrice: item.price }];
        });
    }

    function updateQty(name, change) {
        setOrder(prev =>
            prev
                .map(i =>
                    i.name === name
                        ? { ...i, quantity: i.quantity + change, totalPrice: (i.quantity + change) * i.price }
                        : i
                )
                .filter(i => i.quantity > 0)
        );
    }

    function removeItem(name) {
        setOrder(prev => prev.filter(i => i.name !== name));
    }

    function clearOrder() {
        setOrder([]);
    }

    const total = order.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return { order, addItem, updateQty, removeItem, clearOrder, total };
}