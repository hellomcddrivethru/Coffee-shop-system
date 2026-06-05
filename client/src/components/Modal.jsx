export default function Modal({ modal, onClose }) {
    if (!modal || !modal.isOpen) return null;

    return (
        <div 
            className="modal-overlay" 
            onClick={(e) => {
                if (e.target === e.currentTarget && !modal.hideCancel) {
                    if (modal.onCancel) modal.onCancel();
                    onClose();
                }
            }}
        >
            <div className="modal-container">
                <div className="modal-header">
                    <div className="modal-icon">{modal.icon}</div>
                    <h3>{modal.title}</h3>
                </div>
                <div className="modal-body">
                    <div style={{ whiteSpace: "pre-line" }}>{modal.message}</div>
                </div>
                <div className="modal-footer">
                    {!modal.hideCancel && (
                        <button className="modal-btn modal-btn-cancel" onClick={onClose}>
                            {modal.cancelText || "Cancel"}
                        </button>
                    )}
                    <button 
                        className={`modal-btn ${modal.type === "danger" ? "modal-btn-danger" : "modal-btn-confirm"}`}
                        onClick={() => {
                            if (modal.onConfirm) modal.onConfirm();
                            onClose();
                        }}
                    >
                        {modal.confirmText || "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
}