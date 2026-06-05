fetch('http://localhost:5000/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    total: 25,
    employeeId: 1,
    items: [
      { name: "LATTE", price: 10 },
      { name: "MOCHA", price: 15 }
    ]
  })
}).then(r => r.json()).then(console.log);