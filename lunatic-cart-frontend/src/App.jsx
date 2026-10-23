
import { useEffect, useState } from "react";
import { getProducts } from "./services/productService";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  checkout,
} from "./services/cartService";
import { getMyOrders } from "./services/orderService";
import Auth from "./components/Auth";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [authMessage, setAuthMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [cartLoading, setCartLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [showOrders, setShowOrders] = useState(false);

  // Load products from Spring Boot.
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Convert the backend cart response into the frontend format.
  function normalizeCart(data) {
    const items = data?.items ?? [];

    return items.map((item) => {
      const product = item.product ?? item;

      return {
        ...product,
        id: product.id,
        quantity: item.quantity ?? 1,
        stockQuantity: Number(
          product.stockQuantity ?? product.stock ?? 0
        ),
      };
    });
  }

  // Load the logged-in customer's cart.
  async function loadCart() {
    setCartLoading(true);

    try {
      const data = await getCart();
      setCart(normalizeCart(data));
      setCartMessage("");
    } catch (err) {
      setCartMessage(err.message || "Could not load your cart.");
    } finally {
      setCartLoading(false);
    }
  }

  // Load the cart after login and clear frontend cart state on logout.
  useEffect(() => {
    if (isLoggedIn) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isLoggedIn]);

  // Load only the authenticated customer's orders.
  async function handleViewOrders() {
    setShowOrders(true);
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err.message || "Unable to load your orders.");
    } finally {
      setOrdersLoading(false);
    }
  }

  function handleLogin() {
    setIsLoggedIn(true);
    setAuthMessage("Login successful! Welcome back.");
    setCartMessage("");
  }

  // Add a product to the backend cart.
  async function handleAddToCart(product) {
    if (!isLoggedIn) {
      setCartMessage("Please log in before adding items to your cart.");
      document.getElementById("auth")?.scrollIntoView({
        behavior: "smooth",
      });
      return;
    }

    setCartLoading(true);

    try {
      await addCartItem(product.id, 1);
      await loadCart();
      setCartMessage("Product added to your cart.");
    } catch (err) {
      setCartMessage(err.message || "Unable to add product.");
    } finally {
      setCartLoading(false);
    }
  }

  // Change the quantity of an existing cart item.
  async function handleQuantityChange(item, newQuantity) {
    if (newQuantity < 1) {
      await handleRemoveItem(item.id);
      return;
    }

    setCartLoading(true);

    try {
      await updateCartItem(item.id, newQuantity);
      await loadCart();
      setCartMessage("");
    } catch (err) {
      setCartMessage(err.message || "Unable to update quantity.");
    } finally {
      setCartLoading(false);
    }
  }

  // Remove an item from the backend cart.
  async function handleRemoveItem(productId) {
    setCartLoading(true);

    try {
      await removeCartItem(productId);
      await loadCart();
      setCartMessage("");
    } catch (err) {
      setCartMessage(err.message || "Unable to remove product.");
    } finally {
      setCartLoading(false);
    }
  }

  // Place an order using the backend checkout endpoint.
  async function handleCheckout() {
    setCartLoading(true);

    try {
      await checkout();
      await loadCart();
      setCartMessage("Order placed successfully!");

      // Refresh order history if the section has already been opened.
      if (showOrders) {
        await handleViewOrders();
      }
    } catch (err) {
      setCartMessage(err.message || "Checkout failed.");
    } finally {
      setCartLoading(false);
    }
  }

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity ?? 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price ?? 0) * Number(item.quantity ?? 0),
    0
  );

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCart([]);
    setOrders([]);
    setShowOrders(false);
    setCartMessage("");
    setOrdersError("");
    setAuthMessage("You have logged out.");
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="logo">
          LUNATIC<span>CART</span>
        </h1>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#auth">Login / Register</a>

          <a
            href="#my-orders"
            onClick={(event) => {
              event.preventDefault();

              if (isLoggedIn) {
                handleViewOrders();
                document.getElementById("my-orders")?.scrollIntoView({
                  behavior: "smooth",
                });
              } else {
                setAuthMessage("Please log in to view your orders.");
                document.getElementById("auth")?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
          >
            My Orders
          </a>
        </div>

        {isLoggedIn && (
          <button className="cart-button" onClick={handleLogout}>
            Logout
          </button>
        )}

        <button
          className="cart-button"
          onClick={() =>
            document.getElementById("cart-summary")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          Cart ({cartCount})
        </button>
      </nav>

      <main>
        <section className="hero" id="home">
          <p className="eyebrow">WELCOME TO LUNATICCART</p>
          <h2>
            Shop Beyond
            <br />
            <span>Ordinary.</span>
          </h2>
          <p className="hero-description">
            Discover quality products, exceptional style,
            and a shopping experience made for you.
          </p>
          <a href="#products" className="shop-button">
            Explore Products →
          </a>
        </section>

        <section className="products-section" id="products">
          <p className="eyebrow">YOUR NEXT FAVORITE</p>
          <h2>Featured Products</h2>

          {loading && <p>Loading products...</p>}
          {!loading && error && <p role="alert">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p>No products are available right now.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="product-grid">
              {products.map((product) => {
                const cartItem = cart.find(
                  (item) => item.id === product.id
                );

                const quantityInCart = cartItem?.quantity ?? 0;
                const stock = Number(product.stockQuantity ?? 0);

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-placeholder">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://placehold.co/600x400/19191f/d8ad55?text=Product";
                        }}
                      />
                    </div>

                    <div className="product-info">
                      <p className="product-category">
                        {product.category || "Featured Product"}
                      </p>

                      <h3>{product.name}</h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="product-bottom">
                        <span className="product-price">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>

                        <span className="product-stock">
                          {stock <= 0
                            ? "Out of stock"
                            : `In stock: ${stock}`}
                        </span>
                      </div>

                      <button
                        className="add-to-cart-button"
                        disabled={cartLoading || stock <= 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        {quantityInCart > 0
                          ? `Add Another (${quantityInCart})`
                          : "Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <section className="auth-wrapper" id="auth">
            <Auth
              onLogin={handleLogin}
              onShowMessage={setAuthMessage}
            />

            {authMessage && (
              <p role="status" className="auth-feedback">
                {authMessage}
              </p>
            )}
          </section>

          <div className="cart-summary" id="cart-summary">
            <p className="eyebrow">YOUR SELECTION</p>
            <h3>Your Cart</h3>

            {!isLoggedIn && (
              <p>Please log in to access your saved cart.</p>
            )}

            {isLoggedIn && cartLoading && <p>Updating cart...</p>}

            {isLoggedIn && !cartLoading && cart.length === 0 && (
              <p>Your cart is empty.</p>
            )}

            {isLoggedIn &&
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                      {" × "}
                      {item.quantity}
                    </p>
                  </div>

                  <div className="cart-item-actions">
                    <button
                      className="quantity-button"
                      disabled={cartLoading}
                      onClick={() =>
                        handleQuantityChange(item, item.quantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="quantity-button"
                      disabled={
                        cartLoading ||
                        item.quantity >= item.stockQuantity
                      }
                      onClick={() =>
                        handleQuantityChange(item, item.quantity + 1)
                      }
                    >
                      +
                    </button>

                    <button
                      className="remove-button"
                      disabled={cartLoading}
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

            {isLoggedIn && (
              <>
                <div className="cart-total">
                  <span>Total</span>
                  <strong>
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </strong>
                </div>

                <button
                  className="auth-submit"
                  disabled={cartLoading || cart.length === 0}
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
              </>
            )}

            {cartMessage && (
              <p className="auth-feedback" role="status">
                {cartMessage}
              </p>
            )}
          </div>

          {/* Order history is separate from the product grid. */}
          {isLoggedIn && (
            <section className="orders-section" id="my-orders">
              <h2>My Orders</h2>

              {!showOrders && (
                <button
                  className="auth-submit"
                  onClick={handleViewOrders}
                  disabled={ordersLoading}
                >
                  View My Orders
                </button>
              )}

              {ordersLoading && <p>Loading your orders...</p>}

              {ordersError && (
                <p className="auth-feedback" role="alert">
                  {ordersError}
                </p>
              )}

              {showOrders &&
                !ordersLoading &&
                !ordersError &&
                orders.length === 0 && (
                  <p>You haven't placed any orders yet.</p>
                )}

              {showOrders &&
                !ordersLoading &&
                !ordersError &&
                orders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-header">
                      <h3>Order #{order.id}</h3>
                      <span>{order.status}</span>
                    </div>

                    <p>
                      Date:{" "}
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString("en-IN")
                        : "Not available"}
                    </p>

                    <div className="order-items">
                      <h4>Products purchased</h4>

                      {(order.items ?? []).map((item) => (
                        <div className="order-item" key={item.id}>
                          <div className="order-item-details">
                            <strong>
                              {item.product?.name ?? "Product"}
                            </strong>

                            <p>
                              {item.quantity} × ₹
                              {Number(item.price ?? 0).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <strong>
                            ₹
                            {(
                              Number(item.price ?? 0) *
                              Number(item.quantity ?? 0)
                            ).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-total">
                      <span>Order Total</span>
                      <strong>
                        ₹
                        {Number(order.totalAmount ?? 0).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </article>
                ))}
            </section>
          )}
        </section>
      </main>

      <footer id="about">
        <p>© 2026 LunaticCart. Built with passion.</p>
      </footer>
    </div>
  );
}

export default App;
