export default function OrderItem({ item, index, onQty, onRemove }) {
    return (
        <div className="order-item">
            <div style={{ flex: 1 }}>
                <div className="order-item-name">{item.name}</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <button className="qty-btn" onClick={() => onQty(item.name, -1)}>-</button>
                    <span className="order-item-quantity">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => onQty(item.name, 1)}>+</button>
                </div>
            </div>
            <div>
                <span className="order-item-price">RM{item.totalPrice.toFixed(2)}</span>
                <button className="remove-item" onClick={() => onRemove(item.name)}>✕</button>
            </div>
        </div>
    );
}