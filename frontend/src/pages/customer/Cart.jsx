import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartSubtotal,
    shipping,
    total,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [updatingItem, setUpdatingItem] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const handleQuantityChange = async (
    productId,
    quantity
  ) => {
    if (quantity < 1) {
      return;
    }

    setUpdatingItem(productId);

    try {
      await updateQuantity(productId, quantity);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingItem(productId);

    try {
      await removeFromCart(productId);
    } finally {
      setUpdatingItem(null);
    }
  };

  const openClearCartModal = () => {
    if (clearingCart) {
      return;
    }

    setShowClearModal(true);
  };

  const closeClearCartModal = () => {
    if (clearingCart) {
      return;
    }

    setShowClearModal(false);
  };

  const handleClearCart = async () => {
    setClearingCart(true);

    try {
      await clearCart();
      setShowClearModal(false);
    } finally {
      setClearingCart(false);
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

  if (loading) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <div
            className="empty-cart-icon"
            aria-hidden="true"
          >
            🛒
          </div>

          <span className="section-label">
            YOUR SHOPPING BAG
          </span>

          <h1>Loading your cart...</h1>

          <p>
            We're getting your latest cart items.
          </p>
        </section>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <div
            className="empty-cart-icon"
            aria-hidden="true"
          >
            🛒
          </div>

          <span className="section-label">
            YOUR SHOPPING BAG
          </span>

          <h1>Your Cart is Empty</h1>

          <p>
            Looks like you haven't added anything
            to your cart yet.
          </p>

          {error && (
            <p
              className="cart-error"
              role="alert"
            >
              {error}
            </p>
          )}

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
    <main className="cart-page">
      <section className="cart-header">
        <div className="container">
          <span className="section-label">
            YOUR SHOPPING BAG
          </span>

          <h1>Shopping Cart</h1>

          <p>
            Review your items before continuing
            to checkout.
          </p>
        </div>
      </section>

      <section className="container cart-content">
        <div className="cart-items-section">
          <div className="cart-top-row">
            <strong>
              {cartItems.length}{" "}
              {cartItems.length === 1
                ? "Item"
                : "Items"}
            </strong>

            <button
              type="button"
              onClick={openClearCartModal}
              disabled={clearingCart}
            >
              {clearingCart
                ? "Clearing..."
                : "Clear Cart"}
            </button>
          </div>

          {error && (
            <div
              className="cart-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="cart-items">
            {cartItems.map((item) => {
              const productId = item.id;

              const isUpdating =
                updatingItem === productId;

              const stock =
                item.stock === undefined ||
                item.stock === null
                  ? null
                  : Number(item.stock);

              const isOutOfStock =
                stock !== null && stock <= 0;

              const isLowStock =
                stock !== null &&
                stock > 0 &&
                stock <= 5;

              const reachedStockLimit =
                stock !== null &&
                item.quantity >= stock;

              const imageFailed =
                imageErrors[productId];

              const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);

              return (
                <article
                  className={`cart-item ${
                    isUpdating
                      ? "is-updating"
                      : ""
                  }`}
                  key={
                    item.cartItemId ||
                    productId
                  }
                >
                  <Link
                    to={`/product/${productId}`}
                    className="cart-item-image"
                    aria-label={`View ${item.name}`}
                  >
                    {item.image &&
                    !imageFailed ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={() =>
                          handleImageError(
                            productId
                          )
                        }
                      />
                    ) : (
                      <div className="cart-image-placeholder">
                        <span>
                          Image unavailable
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="cart-item-info">
                    <span className="cart-item-category">
                      {item.category ||
                        "Product"}
                    </span>

                    <Link
                      to={`/product/${productId}`}
                    >
                      <h2>{item.name}</h2>
                    </Link>

                    <p className="cart-item-price">
                      ₹{formatPrice(item.price)}
                    </p>

                    {isOutOfStock && (
                      <span className="cart-stock out">
                        Currently out of stock
                      </span>
                    )}

                    {!isOutOfStock &&
                      isLowStock && (
                        <span className="cart-stock low">
                          Only {stock} left
                        </span>
                      )}

                    <div className="cart-item-actions">
                      <div
                        className="cart-quantity"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              productId,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            item.quantity <= 1 ||
                            isUpdating
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span aria-live="polite">
                          {isUpdating
                            ? "..."
                            : item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              productId,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            isUpdating ||
                            isOutOfStock ||
                            reachedStockLimit
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-item"
                        onClick={() =>
                          handleRemove(
                            productId
                          )
                        }
                        disabled={isUpdating}
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>

                  <strong className="cart-item-total">
                    ₹{formatPrice(itemTotal)}
                  </strong>
                </article>
              );
            })}
          </div>

          <Link
            to="/shop"
            className="continue-shopping-link"
          >
            ← Continue Shopping
          </Link>
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ₹{formatPrice(cartSubtotal)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <strong>
              {shipping === 0
                ? "FREE"
                : `₹${formatPrice(shipping)}`}
            </strong>
          </div>

          {shipping === 0 &&
            cartSubtotal > 0 && (
              <div className="free-shipping-message">
                ✓ You've unlocked free shipping
              </div>
            )}

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>

            <strong>
              ₹{formatPrice(total)}
            </strong>
          </div>

          <Link
            to="/checkout"
            className="checkout-button"
          >
            Proceed to Checkout →
          </Link>

          <button
            type="button"
            className="cart-summary-shop-button"
            onClick={() =>
              navigate("/shop")
            }
          >
            Continue Shopping
          </button>

          <div className="secure-checkout">
            <span aria-hidden="true">
              🔒
            </span>

            Secure checkout
          </div>
        </aside>
      </section>

      {showClearModal && (
        <div
          className="clear-cart-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !clearingCart
            ) {
              closeClearCartModal();
            }
          }}
        >
          <div
            className="clear-cart-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
            aria-describedby="clear-cart-description"
          >
            <button
              type="button"
              className="clear-cart-modal-close"
              onClick={closeClearCartModal}
              disabled={clearingCart}
              aria-label="Close confirmation"
            >
              ×
            </button>

            <div className="clear-cart-modal-icon">
              🛒
            </div>

            <h2 id="clear-cart-title">
              Clear your cart?
            </h2>

            <p id="clear-cart-description">
              Are you sure you want to remove all
              items from your cart? This action
              cannot be undone.
            </p>

            <div className="clear-cart-modal-actions">
              <button
                type="button"
                className="clear-cart-cancel"
                onClick={closeClearCartModal}
                disabled={clearingCart}
              >
                Cancel
              </button>

              <button
                type="button"
                className="clear-cart-confirm"
                onClick={handleClearCart}
                disabled={clearingCart}
              >
                {clearingCart
                  ? "Clearing..."
                  : "Clear Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;