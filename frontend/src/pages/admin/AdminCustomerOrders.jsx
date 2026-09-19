import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrders, getUsers } from "../../services/api";

import "./AdminCustomerOrders.css";

const AdminCustomerOrders = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCustomerOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, ordersResponse] = await Promise.all([
          getUsers(),
          getOrders(),
        ]);

        const userData =
          usersResponse?.data?.data ??
          usersResponse?.data ??
          usersResponse;

        const orderData =
          ordersResponse?.data?.data ??
          ordersResponse?.data ??
          ordersResponse;

        const usersList = Array.isArray(userData)
          ? userData
          : [];

        const ordersList = Array.isArray(orderData)
          ? orderData
          : [];

        const foundCustomer = usersList.find(
          (user) =>
            String(user?._id) === String(customerId)
        );

        if (!foundCustomer) {
          setError("Customer not found.");
          return;
        }

        const customerOrders = ordersList.filter((order) => {
          const orderUserId =
            typeof order?.user_id === "object"
              ? order?.user_id?._id
              : order?.user_id;

          return (
            String(orderUserId) === String(customerId)
          );
        });

        setCustomer(foundCustomer);
        setOrders(customerOrders);
      } catch (err) {
        console.error(
          "Failed to load customer orders:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load customer orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomerOrders();
  }, [customerId]);

  const getInitial = (name) => {
    return (name || "U").charAt(0).toUpperCase();
  };

  const getOrderTotal = (order) => {
    const total =
      order?.total_amount ??
      order?.total ??
      order?.finalTotal ??
      0;

    const numericTotal = Number(total);

    return Number.isFinite(numericTotal)
      ? numericTotal.toFixed(2)
      : "0.00";
  };

  const formatOrderDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => {
      const total = Number(
        order?.total_amount ??
          order?.total ??
          order?.finalTotal ??
          0
      );

      return sum + (Number.isFinite(total) ? total : 0);
    }, 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="admin-customer-orders-page">
        <div className="admin-customer-orders-state">
          <div className="admin-customer-orders-spinner" />
          <p>Loading customer orders...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="admin-customer-orders-page">
        <div className="admin-customer-orders-state admin-customer-orders-error">
          <div className="admin-customer-orders-error-icon">
            !
          </div>

          <h2>Unable to load customer orders</h2>

          <p>
            {error || "Customer information is unavailable."}
          </p>

          <button
            type="button"
            className="admin-customer-orders-back-button"
            onClick={() => navigate("/admin/customers")}
          >
            ← Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customer-orders-page">
      {/* Back */}

      <button
        type="button"
        className="admin-customer-orders-back"
        onClick={() => navigate("/admin/customers")}
      >
        ← Back to Customers
      </button>

      {/* Customer Header */}

      <section className="admin-customer-orders-profile">
        <div className="admin-customer-orders-profile-main">
          <div className="admin-customer-orders-avatar">
            {getInitial(customer.name)}
          </div>

          <div>
            <span className="admin-customer-orders-eyebrow">
              Customer Order History
            </span>

            <h1>
              {customer.name || "Unnamed User"}
            </h1>

            <p>
              {customer.email || "No email"}
            </p>
          </div>
        </div>

        <span className="admin-role-badge customer">
          {customer.role || "customer"}
        </span>
      </section>

      {/* Summary */}

      <div className="admin-customer-orders-summary">
        <div className="admin-customer-orders-stat">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="admin-customer-orders-stat">
          <span>Total Spent</span>
          <strong>
            ₹{totalSpent.toFixed(2)}
          </strong>
        </div>

        <div className="admin-customer-orders-stat">
          <span>Phone</span>
          <strong>
            {customer.phone || "—"}
          </strong>
        </div>
      </div>

      {/* Orders */}

      <section className="admin-customer-orders-card">
        <div className="admin-customer-orders-card-header">
          <div>
            <span>Orders</span>
            <h2>Order History</h2>
          </div>

          <strong>
            {orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"}
          </strong>
        </div>

        {orders.length === 0 ? (
          <div className="admin-customer-orders-empty">
            <div>◌</div>

            <h2>No orders yet</h2>

            <p>
              This customer has not placed any orders.
            </p>
          </div>
        ) : (
          <div className="admin-customer-orders-list">
            {orders.map((order) => (
              <article
                className="admin-customer-order-item"
                key={order?._id}
              >
                <div className="admin-customer-order-item-main">
                  <div>
                    <span>Order ID</span>

                    <strong>
                      #{order?._id || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Date</span>

                    <strong>
                      {formatOrderDate(
                        order?.createdAt ||
                          order?.created_at ||
                          order?.order_date
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Items</span>

                    <strong>
                      {Array.isArray(order?.items)
                        ? order.items.length
                        : 0}
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>

                    <strong>
                      ₹{getOrderTotal(order)}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <em
                      className={`admin-customer-order-status ${String(
                        order?.order_status || "pending"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {order?.order_status || "Pending"}
                    </em>
                  </div>

                  <div>
                    <span>Payment</span>

                    <em
                      className={`admin-customer-payment-status ${String(
                        order?.payment_status || "pending"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {order?.payment_status || "Pending"}
                    </em>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCustomerOrders;