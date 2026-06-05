const API_URL = "http://localhost:5000/api";

export async function getMenu() {
  const res = await fetch(`${API_URL}/menu`);
  return res.json();
}

export async function getMenuWithSales() {
  const res = await fetch(`${API_URL}/reports/menu-with-sales`);
  return res.json();
}