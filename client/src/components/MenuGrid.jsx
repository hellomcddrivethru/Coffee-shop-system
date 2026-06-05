import MenuTile from "./MenuTile";

export default function MenuGrid({ menu, onAdd }) {
    if (!menu || menu.length === 0) {
        return (
            <div className="menu-grid">
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem" }}>
                    No items in this category
                </div>
            </div>
        );
    }

    // Calculate the highest sold quantity
    const maxSold = Math.max(...menu.map(i => Number(i.TotalSold) || 0), 0);

    return (
        <div className="menu-grid">
            {menu.map((item, index) => (
                <MenuTile 
                    key={item.ItemID || index} 
                    item={item} 
                    onAdd={onAdd}
                    maxSold={maxSold}
                />
            ))}
        </div>
    );
}