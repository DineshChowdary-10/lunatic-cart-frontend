
import API_BASE_URL from "../apiConfig";

const CART_URL = `${API_BASE_URL}/cart`;

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
  return sendCartRequest(CART_URL);
}

export function addCartItem(productId, quantity = 1) {
  return sendCartRequest(
    `${CART_URL}/items/${productId}?quantity=${quantity}`,
    { method: "POST" }
  );
}

export function updateCartItem(productId, quantity) {
  return sendCartRequest(
    `${CART_URL}/items/${productId}?quantity=${quantity}`,
    { method: "PUT" }
  );
}

export function removeCartItem(productId) {
  return sendCartRequest(
    `${CART_URL}/items/${productId}`,
    { method: "DELETE" }
  );
}

export function clearCart() {
  return sendCartRequest(CART_URL, { method: "DELETE" });
}

export function getCartTotal() {
  return sendCartRequest(`${CART_URL}/total`);
}

export function checkout() {
  return sendCartRequest(`${CART_URL}/checkout`, {
    method: "POST",
  });
}
