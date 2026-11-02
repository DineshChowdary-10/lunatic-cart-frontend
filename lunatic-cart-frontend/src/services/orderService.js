import API_BASE_URL from "../apiConfig";
const ORDERS_URL = `${API_BASE_URL}/orders`;

export async function getMyOrders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view your orders.");
  }

  const response = await fetch(`${API_BASE_URL}/my-orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to load orders: ${response.status}`
    );
  }

  return response.json();
}
