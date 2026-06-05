import { useState } from "react";

export default function PaymentModal({ total, onConfirm, onClose }) {
    const [method, setMethod] = useState(null);

    const handlePayment = () => {
        if (!method) {
            alert("Please select a payment method");
            return;
        }
        onConfirm(method);
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-container">
                <div className="modal-header">
                    <div className="modal-icon">💰</div>
                    <h3>Select Payment Method</h3>
                </div>
                <div className="modal-body">
                    <div className="payment-amount">
                        <strong>Total: RM{total.toFixed(2)}</strong>
                    </div>
                    <div className="payment-options">
                        <button 
                            className={`payment-option ${method === 'cash' ? 'active' : ''}`}
                            onClick={() => setMethod('cash')}
                        >
                            💵 Cash
                        </button>
                        <button 
                            className={`payment-option ${method === 'qr' ? 'active' : ''}`}
                            onClick={() => setMethod('qr')}
                        >
                            📱 QR Pay
                        </button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn modal-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="modal-btn modal-btn-confirm" onClick={handlePayment}>
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
}