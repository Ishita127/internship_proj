import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./OrderDetails.css";

const ORDER_STEPS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!isAuthenticated) {
        navigate("/login", {
          replace: true,
          state: {
            from: `/orders/${id}`,
          },
        });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getOrderById(id);
        const orderData = response?.data ?? response;

        setOrder(orderData);
      } catch (err) {
        console.error("Failed to load order:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Unable to load this order."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, isAuthenticated, navigate]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCurrentStep = () => {
    if (!order?.order_status) return 0;

    const index = ORDER_STEPS.indexOf(order.order_status);

    return index === -1 ? 0 : index;
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <section className="order-details-loading">
          <div className="order-details-spinner" />
          <p>Loading order details...</p>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <section className="order-details-error">
          <div className="order-error-icon">!</div>

          <span className="section-label">
            ORDER DETAILS
          </span>

          <h1>Order Not Found</h1>

          <p>
            {error || "We couldn't find this order."}
          </p>

          <Link to="/orders" className="order-details-button">
            ← Back to Orders
          </Link>
        </section>
      </main>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <main className="order-details-page">
      <section className="order-details-header">
        <div className="container">
          <Link
            to="/orders"
            className="back-orders-link"
          >
            ← Back to Orders
          </Link>

          <div className="order-heading">
            <div>
              <span className="section-label">
                ORDER DETAILS
              </span>

              <h1>
                #
                {order._id
                  ?.slice(-8)
                  .toUpperCase()}
              </h1>

              <p>
                Placed on {formatDate(order.created_at)}
                {order.created_at &&
                  ` at ${formatTime(order.created_at)}`}
              </p>
            </div>

            <span
              className={`detail-status ${order.order_status?.toLowerCase()}`}
            >
              {order.order_status || "Pending"}
            </span>
          </div>
        </div>
      </section>

      <section className="container order-details-content">
        {/* Tracking */}
        <section className="tracking-card">
          <div className="tracking-header">
            <div>
              <span className="section-label">
                ORDER TRACKING
              </span>

              <h2>
                {order.order_status === "Delivered"
                  ? "Your order has been delivered"
                  : "Track your order"}
              </h2>
            </div>
          </div>

          <div className="tracking-progress">
            {ORDER_STEPS.map((step, index) => {
              const completed = index <= currentStep;
              const active = index === currentStep;

              return (
                <div
                  className={`tracking-step ${
                    completed ? "completed" : ""
                  } ${active ? "active" : ""}`}
                  key={step}
                >
                  <div className="tracking-dot">
                    {completed ? "✓" : ""}
                  </div>

                  <div className="tracking-step-info">
                    <strong>{step}</strong>

                    {active && (
                      <span>
                        Current status
                      </span>
                    )}
                  </div>

                  {index < ORDER_STEPS.length - 1 && (
                    <div
                      className={`tracking-line ${
                        index < currentStep
                          ? "completed"
                          : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="order-details-grid">
          {/* Products */}
          <section className="details-card order-products-card">
            <div className="details-card-header">
              <span className="section-label">
                ITEMS
              </span>

              <h2>Order Items</h2>
            </div>

            <div className="details-products">
              {order.items?.map((item, index) => {
                const product = item.product_id;

                return (
                  <div
                    className="details-product"
                    key={
                      item._id ||
                      `${order._id}-${index}`
                    }
                  >
                    <div className="details-product-image">
                      {product?.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>

                    <div className="details-product-info">
                      <h3>
                        {product?.name ||
                          "Product"}
                      </h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                      <p>
                        ₹
                        {Number(
                          item.price || 0
                        ).toLocaleString("en-IN")}{" "}
                        each
                      </p>
                    </div>

                    <strong>
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Summary */}
          <section className="details-card">
            <div className="details-card-header">
              <span className="section-label">
                SUMMARY
              </span>

              <h2>Order Summary</h2>
            </div>

            <div className="details-summary">
              <div>
                <span>Payment Method</span>
                <strong>
                  {order.payment_method ||
                    "Simulated"}
                </strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong
                  className={`payment-status ${order.payment_status?.toLowerCase()}`}
                >
                  {order.payment_status ||
                    "Pending"}
                </strong>
              </div>

              <div className="summary-total-detail">
                <span>Total Amount</span>

                <strong>
                  ₹
                  {Number(
                    order.total_amount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="details-card delivery-card">
            <div className="details-card-header">
              <span className="section-label">
                DELIVERY
              </span>

              <h2>Delivery Address</h2>
            </div>

            <p className="delivery-address">
              {order.delivery_address ||
                "No delivery address available."}
            </p>
          </section>
        </div>

        <div className="order-details-actions">
          <Link
            to="/orders"
            className="order-details-button secondary"
          >
            ← All Orders
          </Link>

          <Link
            to="/shop"
            className="order-details-button"
          >
            Continue Shopping →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default OrderDetails;