export default function CategoryFilter({ category, onChange }) {
    const categories = [
        { id: "all", label: "ALL" },
        { id: "hot", label: "HOT" },
        { id: "iced", label: "ICED" }
    ];

    return (
        <div className="categories">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    className={`category-btn ${category === cat.id ? "active" : ""}`}
                    onClick={() => onChange(cat.id)}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}