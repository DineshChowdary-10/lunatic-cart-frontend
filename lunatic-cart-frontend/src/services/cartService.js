
const API_BASE_URL = "http://localhost:8080/api/cart";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to access your cart.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function sendCartRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Cart request failed: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function getCart() {
  return sendCartRequest(API_BASE_URL);
}

export function addCartItem(productId, quantity = 1) {
  return sendCartRequest(
    `${API_BASE_URL}/items/${productId}?quantity=${quantity}`,
    { method: "POST" }
  );
}

export function updateCartItem(productId, quantity) {
  return sendCartRequest(
    `${API_BASE_URL}/items/${productId}?quantity=${quantity}`,
    { method: "PUT" }
  );
}

export function removeCartItem(productId) {
  return sendCartRequest(
    `${API_BASE_URL}/items/${productId}`,
    { method: "DELETE" }
  );
}

export function clearCart() {
  return sendCartRequest(API_BASE_URL, { method: "DELETE" });
}

export function getCartTotal() {
  return sendCartRequest(`${API_BASE_URL}/total`);
}

export function checkout() {
  return sendCartRequest(`${API_BASE_URL}/checkout`, {
    method: "POST",
  });
}
