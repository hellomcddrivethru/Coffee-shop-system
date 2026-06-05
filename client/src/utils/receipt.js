export function printReceipt(orderId, order, total) {
    const maxNameLen = Math.max(...order.map(i => i.name.length), 10);
    
    const lines = [
        "================================",
        "      ☕ INSAYNITEA COFFEE ☕",
        "================================",
        `Order #: ${orderId}`,
        `Date: ${new Date().toLocaleString()}`,
        "================================",
        "",
        "ITEMS:"
    ];
    
    order.forEach(item => {
        const name = item.name.padEnd(maxNameLen);
        const qty = `${item.quantity} x RM${item.price.toFixed(2)}`;
        lines.push(` ${name}  ${qty}`);
    });
    
    lines.push(
        "",
        "================================",
        `TOTAL: RM${total.toFixed(2)}`,
        "================================",
        "",
        "Thank you for your order!",
        "☕ Have a great day! ☕",
        "================================"
    );
    
    const receipt = lines.join('\n');
    
    const printWindow = window.open("", "_blank", "width=450,height=600");
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt #${orderId} - Insaynitea</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; margin: 0; display: flex; justify-content: center; background: #f0e5dc; }
                .receipt { max-width: 380px; width: 100%; background: white; padding: 20px; border-radius: 12px; }
                pre { font-size: 13px; font-family: 'Courier New', monospace; margin: 0; white-space: pre-wrap; }
                .qr-section { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc; }
                .qr-section img { width: 180px; height: 180px; margin: 10px auto; display: block; }
                button { margin-top: 20px; padding: 10px; width: 100%; background: #4b672f; color: white; border: none; border-radius: 8px; cursor: pointer; }
                @media print { button { display: none; } body { background: white; } .receipt { box-shadow: none; } }
            </style>
        </head>
        <body>
            <div class="receipt">
                <pre>${receipt}</pre>
                <div class="qr-section">
                    <img src="/bank-qr.png" alt="Payment QR Code" onerror="this.style.display='none'">
                    <p style="font-size: 11px;">Scan QR code to pay</p>
                </div>
                <button onclick="window.print()">🖨️ Print</button>
                <button onclick="window.close()">✕ Close</button>
            </div>
            <script>setTimeout(() => window.print(), 500);<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}