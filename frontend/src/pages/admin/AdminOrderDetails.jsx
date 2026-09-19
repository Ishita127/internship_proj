import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getOrderById,
  getUsers,
  updateOrderStatus,
} from "../../services/api";

import "./AdminOrderDetails.css";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Store order, customer and page state
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Load order details and customer information
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const [orderResponse, usersResponse] = await Promise.all([
          getOrderById(id),
          getUsers(),
        ]);

        const orderData = orderResponse?.data ?? orderResponse;

        const usersData = Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse?.data || [];

        setOrder(orderData);
        setSelectedStatus(orderData?.order_status || "Pending");

        // Find the customer connected to this order
        const orderUserId =
          typeof orderData?.user_id === "object"
            ? orderData?.user_id?._id ||
              orderData?.user_id?.id
            : orderData?.user_id;

        const matchedCustomer = usersData.find(
          (user) =>
            String(user?._id || user?.id) ===
            String(orderUserId)
        );

        setCustomer(
          orderData?.user_id?.name ||
            orderData?.user_id?.email
            ? orderData.user_id
            : matchedCustomer || null
        );
      } catch (err) {
        console.error("Failed to load order:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  // Update the order fulfillment status
  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus) return;

    if (selectedStatus === order.order_status) return;

    try {
      setUpdating(true);
      setError("");

      const response = await updateOrderStatus(
        order._id,
        selectedStatus
      );

      const updatedOrder = response?.data ?? response;

      setOrder((current) => ({
        ...current,
        ...(updatedOrder || {}),
        order_status:
          updatedOrder?.order_status || selectedStatus,
      }));

      setSelectedStatus(
        updatedOrder?.order_status || selectedStatus
      );
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Display loading state while order data is being fetched
  if (loading) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-loading">
          <div className="admin-spinner" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  // Display an error when the order cannot be loaded
  if (error && !order) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-error">
          <h2>Unable to load order</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Display an empty state when no order is available
  if (!order) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-empty">
          <h2>Order not found</h2>
          <p>The requested order could not be found.</p>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  // Use backend-calculated order values with fallbacks for older orders
  const itemsSubtotal =
    order.subtotal ??
    order.total_amount ??
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );

  const shipping =
    order.delivery_charges ??
    0;

  const discount =
    order.discount ??
    0;

  const orderTotal =
    order.total ??
    order.total_amount ??
    itemsSubtotal + shipping - discount;

  return (
    <div className="admin-order-details-page">
      {/* Page header */}

      <div className="admin-order-details-header">
        <div>
          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/admin/orders")}
          >
            ← Back to Orders
          </button>

          <div className="admin-order-title-row">
            <div>
              <p className="admin-page-eyebrow">
                ORDER DETAILS
              </p>

              <h1>
                Order #
                {String(order._id || id)
                  .slice(-8)
                  .toUpperCase()}
              </h1>

              <p className="admin-order-date">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>

            <span
              className={`admin-order-status-badge ${String(
                order.order_status || "Pending"
              )
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {order.order_status || "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Display inline errors while keeping the order visible */}

      {error && order && (
        <div className="admin-inline-error">
          {error}
        </div>
      )}

      <div className="admin-order-details-grid">
        {/* Main order information */}

        <div className="admin-order-main-column">
          {/* Order items */}

          <section className="admin-order-card">
            <div className="admin-card-header">
              <div>
                <h2>Order Items</h2>
                <p>
                  {items.length}{" "}
                  {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <div className="admin-order-items">
              {items.length === 0 ? (
                <div className="admin-order-no-items">
                  No items available for this order.
                </div>
              ) : (
                items.map((item, index) => {
                  const product = item.product_id;

                  const productName =
                    typeof product === "object"
                      ? product?.name
                      : "Product";

                  const productImage =
                    typeof product === "object"
                      ? product?.image
                      : null;

                  const price = Number(item.price || 0);
                  const quantity = Number(item.quantity || 0);

                  return (
                    <div
                      className="admin-order-item"
                      key={
                        item._id ||
                        item.product_id?._id ||
                        item.product_id ||
                        index
                      }
                    >
                      <div className="admin-order-product-image">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>

                      <div className="admin-order-product-info">
                        <h3>
                          {productName || "Product"}
                        </h3>

                        <p>
                          Quantity:{" "}
                          <strong>{quantity}</strong>
                        </p>
                      </div>

                      <div className="admin-order-product-price">
                        <span>
                          {formatCurrency(price)}
                        </span>

                        <small>
                          × {quantity}
                        </small>
                      </div>

                      <div className="admin-order-product-total">
                        {formatCurrency(
                          price * quantity
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Order price breakdown */}

            <div className="admin-order-summary">
              <div>
                <span>Items subtotal</span>
                <strong>
                  {formatCurrency(itemsSubtotal)}
                </strong>
              </div>

              <div>
                <span>Shipping</span>
                <strong>
                  {shipping === 0
                    ? "FREE"
                    : formatCurrency(shipping)}
                </strong>
              </div>

              {discount > 0 && (
                <div>
                  <span>Discount</span>
                  <strong>
                    -{formatCurrency(discount)}
                  </strong>
                </div>
              )}

              <div className="admin-order-grand-total">
                <span>Total</span>
                <strong>
                  {formatCurrency(orderTotal)}
                </strong>
              </div>
            </div>
          </section>

          {/* Delivery information */}

          <section className="admin-order-card">
            <div className="admin-card-header">
              <div>
                <h2>Delivery Information</h2>
                <p>Customer delivery address</p>
              </div>
            </div>

            <div className="admin-delivery-address">
              <span className="admin-info-icon">⌖</span>

              <div>
                <strong>
                  {customer?.name || "Customer"}
                </strong>

                <p>
                  {order.delivery_address ||
                    "No delivery address provided."}
                </p>
              </div>
            </div>
          </section>

          {/* Order status timeline */}

          <section className="admin-order-card">
            <div className="admin-card-header">
              <div>
                <h2>Order Progress</h2>
                <p>Current fulfillment status</p>
              </div>
            </div>

            <div className="admin-order-timeline">
              {ORDER_STATUSES.map((status, index) => {
                const currentIndex =
                  ORDER_STATUSES.indexOf(
                    order.order_status
                  );

                const isCompleted =
                  index <= currentIndex;

                const isCurrent =
                  status === order.order_status;

                return (
                  <div
                    className={`admin-timeline-step ${
                      isCompleted ? "completed" : ""
                    } ${isCurrent ? "current" : ""}`}
                    key={status}
                  >
                    <div className="admin-timeline-marker">
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    <div>
                      <strong>{status}</strong>

                      {isCurrent && (
                        <span>
                          Current status
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Customer, payment and status controls */}

        <aside className="admin-order-side-column">
          {/* Customer information */}

          <section className="admin-order-card">
            <div className="admin-card-header">
              <div>
                <h2>Customer</h2>
                <p>Customer information</p>
              </div>
            </div>

            <div className="admin-customer-profile">
              <div className="admin-customer-avatar">
                {(customer?.name || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {customer?.name || "Customer"}
                </strong>

                <span>
                  {customer?.email ||
                    "Email unavailable"}
                </span>
              </div>
            </div>

            {customer?.phone && (
              <div className="admin-customer-detail">
                <span>Phone</span>
                <strong>{customer.phone}</strong>
              </div>
            )}
          </section>

          {/* Payment information */}

          <section className="admin-order-card">
            <div className="admin-card-header">
              <div>
                <h2>Payment</h2>
                <p>Payment information</p>
              </div>
            </div>

            <div className="admin-payment-row">
              <span>Method</span>
              <strong>
                {order.payment_method || "Simulated"}
              </strong>
            </div>

            <div className="admin-payment-row">
              <span>Status</span>

              <span
                className={`admin-payment-status ${
                  String(
                    order.payment_status || "Pending"
                  ).toLowerCase()
                }`}
              >
                {order.payment_status || "Pending"}
              </span>
            </div>

            <div className="admin-payment-total">
              <span>Order Total</span>
              <strong>
                {formatCurrency(orderTotal)}
              </strong>
            </div>
          </section>

          {/* Update order status */}

          <section className="admin-order-card admin-status-card">
            <div className="admin-card-header">
              <div>
                <h2>Update Status</h2>
                <p>
                  Change the order fulfillment status
                </p>
              </div>
            </div>

            <label
              htmlFor="order-status"
              className="admin-field-label"
            >
              Order Status
            </label>

            <select
              id="order-status"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              disabled={updating}
            >
              {ORDER_STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-update-status-button"
              onClick={handleStatusUpdate}
              disabled={
                updating ||
                selectedStatus ===
                  order.order_status
              }
            >
              {updating
                ? "Updating..."
                : "Update Order Status"}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AdminOrderDetails;