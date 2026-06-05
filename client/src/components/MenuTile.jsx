export default function MenuTile({ item, onAdd, maxSold }) {
    const totalSold = Number(item.TotalSold) || 0;
    let badge = null;

    if (totalSold === maxSold && maxSold > 0) {
        badge = <span className="bestseller-badge">🏆 BESTSELLER</span>;
    } else if (totalSold > 10) {
        badge = <span className="popular-badge">🔥 POPULAR</span>;
    }

    return (
        <div className="menu-tile">
            <div className="tile-content">
                {badge}
                <span className="tile-icon">{item.Category === "hot" ? "🔥" : "🧊"}</span>
                <h3>{item.ItemName}</h3>
                <p className="price">RM{Number(item.Price).toFixed(2)}</p>
                <button
                    className="add-order-btn"
                    onClick={() => onAdd({ name: item.ItemName, price: Number(item.Price) })}
                >
                    + ADD
                </button>
            </div>
        </div>
    );
}