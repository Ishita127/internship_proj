import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/api";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const {
    cartItems,
    cartSubtotal,
    shipping,
    total,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [imageErrors, setImageErrors] =
    useState({});

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((current) => ({
      ...current,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/checkout",
        },
      });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const state = formData.state.trim();
    const pincode = formData.pincode.trim();

    if (!name) {
      return "Please enter your full name.";
    }

    if (!email) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return "Please enter a valid email address.";
    }

    const normalizedPhone =
      phone.replace(/\D/g, "");

    if (normalizedPhone.length !== 10) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!address) {
      return "Please enter your delivery address.";
    }

    if (!city) {
      return "Please enter your city.";
    }

    if (!state) {
      return "Please enter your state.";
    }

    if (!/^\d{6}$/.test(pincode)) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const deliveryAddress = [
        formData.name.trim(),
        formData.address.trim(),
        formData.city.trim(),
        formData.state.trim(),
        formData.pincode.trim(),
        formData.phone.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      const orderData = {
        total_amount: total,

        payment_method: "Simulated",

        payment_status:
          paymentMethod === "cod"
            ? "Pending"
            : "Completed",

        delivery_address:
          deliveryAddress,

        discount: 0,

        items: cartItems.map(
          (item) => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })
        ),
      };

      const response =
        await createOrder(orderData);

      const createdOrder =
        response?.data;

      if (!createdOrder) {
        throw new Error(
          "Order could not be created."
        );
      }

      const createdOrderId =
        createdOrder._id ||
        createdOrder.id;

      setOrderNumber(
        createdOrderId
          ? `SV-${createdOrderId
              .slice(-8)
              .toUpperCase()}`
          : "SHOPVERSE-ORDER"
      );

      try {
        await clearCart();
      } catch (cartError) {
        console.error(
          "Cart cleanup failed after order creation:",
          cartError
        );
      }

      setOrderPlaced(true);
    } catch (err) {
      console.error(
        "Order creation failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors((current) => ({
      ...current,
      [productId]: true,
    }));
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <section className="order-success">
          <div
            className="success-icon"
            aria-hidden="true"
          >
            ✓
          </div>

          <span className="section-label">
            ORDER CONFIRMED
          </span>

          <h1>
            Thank You for Your Order!
          </h1>

          <p>
            Your order has been placed
            successfully.
          </p>

          <div className="order-number">
            <span>
              Order Number
            </span>

            <strong>
              {orderNumber}
            </strong>
          </div>

          <p className="success-message">
            We've received your order
            and will process it shortly.
          </p>

          <div className="success-actions">
            <Link
              to="/orders"
              className="continue-shopping"
            >
              View My Orders →
            </Link>

            <Link
              to="/shop"
              className="continue-shopping"
            >
              Continue Shopping →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="empty-checkout">
          <div
            className="empty-checkout-icon"
            aria-hidden="true"
          >
            🛒
          </div>

          <span className="section-label">
            CHECKOUT
          </span>

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Add some products to your
            cart before checking out.
          </p>

          <Link
            to="/shop"
            className="continue-shopping"
          >
            Start Shopping →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-header">
        <div className="container">
          <span className="section-label">
            SECURE CHECKOUT
          </span>

          <h1>Checkout</h1>

          <p>
            Complete your details to
            place your order.
          </p>
        </div>
      </section>

      <section className="container checkout-content">
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <div className="checkout-section">
            <h2>
              Contact Information
            </h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength="10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>
              Delivery Address
            </h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  placeholder="House number, street, area"
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">
                  PIN Code
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={handleChange}
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength="6"
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>
              Payment Method
            </h2>

            <div className="payment-options">
              <label
                className={`payment-option ${
                  paymentMethod === "cod"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    paymentMethod === "cod"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <span>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your order
                    arrives
                  </small>
                </span>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "card"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={
                    paymentMethod === "card"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <span>
                  <strong>
                    Credit / Debit Card
                  </strong>

                  <small>
                    Simulated payment
                  </small>
                </span>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "upi"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={
                    paymentMethod === "upi"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <span>
                  <strong>
                    UPI
                  </strong>

                  <small>
                    Simulated payment
                  </small>
                </span>
              </label>
            </div>

            <div className="payment-note">
              Payment is simulated for
              this project. No real payment
              will be processed.
            </div>
          </div>

          {error && (
            <div
              className="checkout-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="checkout-actions">
            <Link
              to="/cart"
              className="back-to-cart"
            >
              ← Back to Cart
            </Link>

            <button
              type="submit"
              className="place-order-button"
              disabled={loading}
            >
              {loading
                ? "Placing Order..."
                : "Place Order →"}
            </button>
          </div>
        </form>

        <aside className="checkout-summary">
          <h2>
            Order Summary
          </h2>

          <div className="checkout-products">
            {cartItems.map((item) => {
              const productId = item.id;
              const imageFailed =
                imageErrors[productId];

              return (
                <div
                  className="checkout-product"
                  key={
                    item.cartItemId ||
                    productId
                  }
                >
                  <div className="checkout-product-image">
                    {item.image &&
                    !imageFailed ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={() =>
                          handleImageError(
                            productId
                          )
                        }
                      />
                    ) : (
                      <div className="checkout-image-placeholder">
                        —
                      </div>
                    )}

                    <span>
                      {item.quantity}
                    </span>
                  </div>

                  <div className="checkout-product-info">
                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      ₹
                      {formatPrice(
                        item.price
                      )}
                    </p>
                  </div>

                  <strong>
                    ₹
                    {formatPrice(
                      Number(
                        item.price || 0
                      ) *
                        Number(
                          item.quantity || 0
                        )
                    )}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {formatPrice(
                cartSubtotal
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Shipping
            </span>

            <strong>
              {shipping === 0
                ? "FREE"
                : `₹${formatPrice(
                    shipping
                  )}`}
            </strong>
          </div>

          {shipping === 0 &&
            cartSubtotal > 0 && (
              <div className="free-shipping-message">
                ✓ Free shipping applied
              </div>
            )}

          <div className="summary-divider" />

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              ₹
              {formatPrice(total)}
            </strong>
          </div>

          <div className="secure-checkout">
            <span aria-hidden="true">
              🔒
            </span>

            Secure checkout
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Checkout;