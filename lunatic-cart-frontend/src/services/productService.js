
const API_BASE_URL = "http://localhost:8080/api";

const productImages = {
  4: {
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=80",
  },
  5: {
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=700&q=80",
  },
  6: {
    category: "Audio",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  },
  7: {
    category: "Audio",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  },
  8: {
    category: "Gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=700&q=80",
  },
};

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data = await response.json();

  return data.map((product) => ({
    ...product,
    ...productImages[product.id],
    stockQuantity: Number(
      product.stockQuantity ?? product.stock ?? 0
    ),
  }));
}
