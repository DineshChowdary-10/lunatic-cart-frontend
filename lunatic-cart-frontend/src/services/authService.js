
import API_BASE_URL from "../apiConfig";

const AUTH_URL = `${API_BASE_URL}/auth`;

async function sendAuthRequest(endpoint, userData) {
  const response = await fetch(`${AUTH_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

export function registerUser(name, email, password) {
  return sendAuthRequest("register", {
    name,
    email,
    password,
  });
}

export function loginUser(email, password) {
  return sendAuthRequest("login", {
    email,
    password,
  });
}
