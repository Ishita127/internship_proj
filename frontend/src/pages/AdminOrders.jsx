import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOrders,
  getUsers,
  updateOrderStatus,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AdminOrders.css";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

const AdminOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        getOrders(),
        getUsers(),
      ]);

      const ordersData = Array.isArray(ordersResponse)
        ? ordersResponse
        : ordersResponse?.data || [];

      const usersData = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse?.data || [];

      setOrders(ordersData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to load admin orders:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const getOrderId = (order) => order?._id || order?.id;

  const getUserId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return String(value._id || value.id || "");
    }

    return String(value);
  };

  const getCustomer = (order) => {
    if (order?.user_id?.name || order?.user_id?.email) {
      return order.user_id;
    }

    const orderUserId = getUserId(order?.user_id);

    return users.find(
      (customer) =>
        getUserId(customer?._id || customer?.id) === orderUserId
    );
  };

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCustomerName = (order) => {
    const customer = getCustomer(order);

    return customer?.name || "Customer";
  };

  const getCustomerEmail = (order) => {
    const customer = getCustomer(order);

    return customer?.email || "—";
  };

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(getOrderId(order) || "").toLowerCase();

      const customerName = getCustomerName(order).toLowerCase();

      const customerEmail = getCustomerEmail(order).toLowerCase();

      const matchesSearch =
        !searchValue ||
        orderId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order.order_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, users, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(
        (order) => order.order_status === "Pending"
      ).length,
      processing: orders.filter(
        (order) => order.order_status === "Processing"
      ).length,
      shipped: orders.filter(
        (order) => order.order_status === "Shipped"
      ).length,
      delivered: orders.filter(
        (order) => order.order_status === "Delivered"
      ).length,
    };
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await updateOrderStatus(
        orderId,
        newStatus
      );

      const updatedOrder = response?.data || response;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          String(getOrderId(order)) === String(orderId)
            ? {
                ...order,
                ...(updatedOrder || {}),
                order_status: newStatus,
              }
            : order
        )
      );

      setSuccess(`Order status updated to ${newStatus}.`);

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="admin-orders-page">
        <div className="admin-orders-loading">
          <div className="admin-orders-spinner" />
          <p>Loading orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <p className="admin-section-eyebrow">
            SALES MANAGEMENT
          </p>

          <h1>Orders</h1>

          <p>
            Manage customer orders, payments and fulfillment status.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh"
          onClick={loadOrders}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="admin-orders-alert error">
          <span>!</span>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="admin-orders-alert success">
          <span>✓</span>
          <p>{success}</p>
        </div>
      )}

      <div className="admin-orders-summary">
        <button
          type="button"
          className={`admin-order-summary-card ${
            statusFilter === "all" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <span>Total Orders</span>
          <strong>{statusCounts.all}</strong>
        </button>

        <button
          type="button"
          className={`admin-order-summary-card ${
            statusFilter === "Pending" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("Pending")}
        >
          <span>Pending</span>
          <strong>{statusCounts.pending}</strong>
        </button>

        <button
          type="button"
          className={`admin-order-summary-card ${
            statusFilter === "Processing" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("Processing")}
        >
          <span>Processing</span>
          <strong>{statusCounts.processing}</strong>
        </button>

        <button
          type="button"
          className={`admin-order-summary-card ${
            statusFilter === "Shipped" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("Shipped")}
        >
          <span>Shipped</span>
          <strong>{statusCounts.shipped}</strong>
        </button>

        <button
          type="button"
          className={`admin-order-summary-card ${
            statusFilter === "Delivered" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("Delivered")}
        >
          <span>Delivered</span>
          <strong>{statusCounts.delivered}</strong>
        </button>
      </div>

      <div className="admin-orders-toolbar">
        <div className="admin-orders-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Statuses</option>

          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-orders-card">
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="admin-orders-empty">
                      <div>▣</div>

                      <h3>No orders found</h3>

                      <p>
                        There are no orders matching your current
                        search or filter.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderId = getOrderId(order);

                  const itemCount =
                    order.items?.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr key={orderId}>
                      <td>
                        <div className="admin-order-id">
                          <strong>
                            #{String(orderId || "")
                              .slice(-8)
                              .toUpperCase()}
                          </strong>

                          <small>
                            {order.payment_method || "Simulated"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-customer">
                          <strong>
                            {getCustomerName(order)}
                          </strong>

                          <small>
                            {getCustomerEmail(order)}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className="admin-order-date">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      <td>
                        <span className="admin-order-items">
                          {itemCount}{" "}
                          {itemCount === 1 ? "item" : "items"}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-order-total">
                          {formatPrice(
                            order.total_amount ??
                              order.total
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="admin-payment-info">
                          <span>
                            {order.payment_method || "Simulated"}
                          </span>

                          <small
                            className={
                              order.payment_status === "Completed"
                                ? "completed"
                                : "pending"
                            }
                          >
                            {order.payment_status || "Pending"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <select
                          className={`admin-order-status-select ${String(
                            order.order_status || "Pending"
                          )
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                          value={
                            order.order_status || "Pending"
                          }
                          disabled={updatingId === orderId}
                          onChange={(event) =>
                            handleStatusChange(
                              orderId,
                              event.target.value
                            )
                          }
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
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-order-view-button"
                          onClick={() =>
                            navigate(
                              `/admin/orders/${orderId}`
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 0 && (
          <div className="admin-orders-footer">
            Showing <strong>{filteredOrders.length}</strong> of{" "}
            <strong>{orders.length}</strong> orders
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminOrders;