import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrders } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

function Orders() {
const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getOrders();

        const orderData = response?.data ?? response;

        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (err) {
        console.error("Failed to load orders:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  if (!isAuthenticated) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <div className="orders-empty-icon">🔐</div>

          <span className="section-label">
            MY ORDERS
          </span>

          <h1>Please Sign In</h1>

          <p>
            Sign in to view your order history.
          </p>

          <Link to="/login" className="orders-button">
            Sign In →
          </Link>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-header">
          <div className="container">
            <span className="section-label">
              MY ORDERS
            </span>

            <h1>Your Orders</h1>

            <p>
              Loading your order history...
            </p>
          </div>
        </section>

        <section className="container orders-loading">
          <div className="orders-spinner" />
          <p>Loading orders...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <section className="orders-header">
          <div className="container">
            <span className="section-label">
              MY ORDERS
            </span>

            <h1>Your Orders</h1>
          </div>
        </section>

        <section className="container orders-error">
          <div className="orders-error-icon">!</div>

          <h2>Unable to load orders</h2>

          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="orders-button"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <section className="orders-header">
          <div className="container">
            <span className="section-label">
              MY ORDERS
            </span>

            <h1>Your Orders</h1>

            <p>
              View and track everything you've purchased.
            </p>
          </div>
        </section>

        <section className="container orders-empty">
          <div className="orders-empty-icon">📦</div>

          <h2>No Orders Yet</h2>

          <p>
            You haven't placed any orders yet.
          </p>

          <Link to="/shop" className="orders-button">
            Start Shopping →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-header">
        <div className="container">
          <span className="section-label">
            MY ORDERS
          </span>

          <h1>Your Orders</h1>

          <p>
            View and track everything you've purchased.
          </p>
        </div>
      </section>

      <section className="container orders-content">
        <div className="orders-count">
          {orders.length}{" "}
          {orders.length === 1 ? "Order" : "Orders"}
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <article
            className="order-card"
            key={order._id}
            onClick={() => navigate(`/orders/${order._id}`)}
            style={{ cursor: "pointer" }}
          >
              <div className="order-card-header">
                <div>
                  <span className="order-label">
                    ORDER
                  </span>

                  <h2>
                    #
                    {order._id
                      ?.slice(-8)
                      .toUpperCase()}
                  </h2>

                  <p>
                    Placed on{" "}
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="order-status-wrapper">
                  <span className="order-label">
                    STATUS
                  </span>

                  <span
                    className={`order-status ${getStatusClass(
                      order.order_status
                    )}`}
                  >
                    {order.order_status || "Pending"}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item, index) => {
                  const product = item.product_id;

                  return (
                    <div
                      className="order-item"
                      key={
                        item._id ||
                        `${order._id}-${index}`
                      }
                    >
                      <div className="order-item-image">
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>

                      <div className="order-item-info">
                        <h3>
                          {product?.name ||
                            "Product"}
                        </h3>

                        <p>
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="order-card-footer">
                <div className="order-payment">
                  <span>Payment</span>

                  <strong>
                    {order.payment_status ||
                      "Pending"}
                  </strong>
                </div>

                <div className="order-total">
                  <span>Total</span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              {order.delivery_address && (
                <div className="order-address">
                  <span>Delivery Address</span>

                  <p>{order.delivery_address}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Orders;