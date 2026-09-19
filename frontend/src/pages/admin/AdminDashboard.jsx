import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  getOrders,
  getProducts,
} from "../../services/api";
import "./AdminDashboard.css";

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "—";

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

const getOrderTotal = (order) => {
  return Number(
    order?.total_amount ??
    order?.total ??
    order?.grand_total ??
    0
  );
};

const isDeliveredOrder = (order) => {
  return String(order?.order_status || "").toLowerCase() === "delivered";
};

const getStatusClass = (status) => {
  return String(status || "Pending")
    .toLowerCase()
    .replaceAll(" ", "-");
};

const extractList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

const Icon = ({ name, size = 22 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    box: (
      <>
        <path d="m21 8-9 5-9-5" />
        <path d="M3 8.5 12 3l9 5.5v7L12 21l-9-5.5z" />
        <path d="M12 13v8" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    rupee: (
      <>
        <path d="M6 5h12" />
        <path d="M6 9h9a4 4 0 0 0 0-8H6" />
        <path d="m9 9 7 10" />
      </>
    ),
    trend: (
      <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M16 6h5v5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 4-4 3 2 5-7" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 9 17H3z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          statsResponse,
          ordersResponse,
          productsResponse,
        ] = await Promise.all([
          getDashboardStats(),
          getOrders(),
          getProducts(),
        ]);

        const dashboardStats =
          statsResponse?.data &&
            !Array.isArray(statsResponse.data)
            ? statsResponse.data
            : statsResponse || {};

        setStats(dashboardStats);
        setOrders(extractList(ordersResponse));
        setProducts(extractList(productsResponse));
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        setError(
          err?.response?.data?.message ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalProducts =
    stats?.totalProducts ??
    stats?.products ??
    stats?.productCount ??
    products.length ??
    0;

  const totalOrders =
    stats?.totalOrders ??
    stats?.orders ??
    stats?.orderCount ??
    orders.length ??
    0;

  const totalCustomers =
    stats?.totalCustomers ??
    stats?.totalUsers ??
    stats?.users ??
    stats?.userCount ??
    stats?.customers ??
    0;

  /* Revenue is calculated from delivered orders only */
  const calculatedRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (!isDeliveredOrder(order)) {
        return sum;
      }

      return sum + getOrderTotal(order);
    }, 0);
  }, [orders]);

  const totalSales =
    Number(
      stats?.totalRevenue ??
      stats?.totalSales ??
      stats?.sales ??
      stats?.revenue ??
      0
    ) || calculatedRevenue;

  const inventory = useMemo(() => {
    const active = products.filter(
      (product) =>
        String(product?.status || "Active").toLowerCase() ===
        "active"
    ).length;

    /* Backend dashboard rule: low stock means below 5 */
    const lowStock = products.filter((product) => {
      const stock = Number(product?.stock || 0);
      return stock > 0 && stock < 5;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product?.stock || 0) <= 0
    ).length;

    return {
      active,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0) -
          new Date(a?.created_at || 0)
      )
      .slice(0, 6);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => {
        const stock = Number(product?.stock || 0);
        return stock > 0 && stock < 5;
      })
      .sort(
        (a, b) =>
          Number(a?.stock || 0) -
          Number(b?.stock || 0)
      )
      .slice(0, 5);
  }, [products]);

  const monthlySales = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        sales: 0,
        orders: 0,
      });
    }

    orders.forEach((order) => {
      if (!isDeliveredOrder(order)) return;
      if (!order?.created_at) return;

      const date = new Date(order.created_at);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((item) => item.key === key);

      if (month) {
        month.sales += getOrderTotal(order);
        month.orders += 1;
      }
    });

    return months;
  }, [orders]);

  const maxMonthlySales = Math.max(
    ...monthlySales.map((month) => month.sales),
    1
  );

  const orderStatuses = useMemo(() => {
    const statuses = [
      {
        name: "Pending",
        className: "pending",
        count: 0,
      },
      {
        name: "Confirmed",
        className: "confirmed",
        count: 0,
      },
      {
        name: "Processing",
        className: "processing",
        count: 0,
      },
      {
        name: "Shipped",
        className: "shipped",
        count: 0,
      },
      {
        name: "Delivered",
        className: "delivered",
        count: 0,
      },
    ];

    orders.forEach((order) => {
      const status = String(
        order?.order_status || "Pending"
      ).toLowerCase();

      const match = statuses.find(
        (item) => item.name.toLowerCase() === status
      );

      if (match) {
        match.count += 1;
      }
    });

    return statuses;
  }, [orders]);

  const totalStatusOrders = orderStatuses.reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-state">
          <div className="admin-dashboard-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-state admin-dashboard-error">
          <div className="admin-dashboard-state-icon">
            <Icon name="warning" size={24} />
          </div>

          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-glow glow-one" />
      <div className="admin-dashboard-glow glow-two" />

      <div className="admin-dashboard-content">
        <header className="admin-dashboard-header">
          <div>
            <div className="admin-dashboard-welcome">
              <span className="admin-dashboard-live-dot" />
              LIVE STORE OVERVIEW
            </div>

            <h1>Dashboard</h1>

            <p>
              Everything you need to understand your store at a glance.
            </p>
          </div>

          <button
            type="button"
            className="admin-dashboard-primary-button"
            onClick={() =>
              navigate("/admin/products/new")
            }
          >
            <Icon name="plus" size={18} />
            Add Product
          </button>
        </header>

        <section className="admin-dashboard-kpis">
          <div className="admin-dashboard-kpi kpi-products">
            <div className="admin-dashboard-kpi-top">
              <div className="admin-dashboard-kpi-icon">
                <Icon name="box" size={22} />
              </div>

              <span className="admin-dashboard-kpi-badge">
                Catalog
              </span>
            </div>

            <div>
              <span className="admin-dashboard-kpi-label">
                Total Products
              </span>

              <strong>{totalProducts}</strong>

              <small>
                Products in your store
              </small>
            </div>
          </div>

          <div className="admin-dashboard-kpi kpi-orders">
            <div className="admin-dashboard-kpi-top">
              <div className="admin-dashboard-kpi-icon">
                <Icon name="cart" size={22} />
              </div>

              <span className="admin-dashboard-kpi-badge">
                Orders
              </span>
            </div>

            <div>
              <span className="admin-dashboard-kpi-label">
                Total Orders
              </span>

              <strong>{totalOrders}</strong>

              <small>
                Customer purchases
              </small>
            </div>
          </div>

          <div className="admin-dashboard-kpi kpi-customers">
            <div className="admin-dashboard-kpi-top">
              <div className="admin-dashboard-kpi-icon">
                <Icon name="users" size={22} />
              </div>

              <span className="admin-dashboard-kpi-badge">
                Community
              </span>
            </div>

            <div>
              <span className="admin-dashboard-kpi-label">
                Customers
              </span>

              <strong>{totalCustomers}</strong>

              <small>
                Registered customers
              </small>
            </div>
          </div>

          <div className="admin-dashboard-kpi kpi-sales">
            <div className="admin-dashboard-kpi-top">
              <div className="admin-dashboard-kpi-icon">
                <Icon name="rupee" size={22} />
              </div>

              <span className="admin-dashboard-kpi-badge">
                Revenue
              </span>
            </div>

            <div>
              <span className="admin-dashboard-kpi-label">
                Total Sales
              </span>

              <strong>{formatCurrency(totalSales)}</strong>

              <small>
                Total order value
              </small>
            </div>
          </div>
        </section>

        <div className="admin-dashboard-main-grid">
          <section className="admin-dashboard-card sales-card">
            <div className="admin-dashboard-card-header">
              <div>
                <div className="admin-dashboard-section-icon teal">
                  <Icon name="chart" size={19} />
                </div>

                <div>
                  <h2>Sales Overview</h2>
                  <p>Revenue generated over the last 6 months</p>
                </div>
              </div>

              <span className="admin-dashboard-period">
                Last 6 Months
              </span>
            </div>

            <div className="sales-summary">
              <div>
                <strong>{formatCurrency(totalSales)}</strong>
                <span>
                  <Icon name="trend" size={14} />
                  Store revenue
                </span>
              </div>
            </div>

            <div className="sales-chart">
              <div className="sales-grid-lines">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="sales-bars">
                {monthlySales.map((month) => {
                  const height =
                    month.sales === 0
                      ? 8
                      : Math.max(
                        16,
                        (month.sales / maxMonthlySales) * 100
                      );

                  return (
                    <div
                      className="sales-bar-column"
                      key={month.key}
                    >
                      <div className="sales-bar-value">
                        {month.sales > 0
                          ? formatCurrency(month.sales)
                          : "₹0"}
                      </div>

                      <div className="sales-bar-track">
                        <div
                          className="sales-bar-fill"
                          style={{
                            height: `${height}%`,
                          }}
                        >
                          <span />
                        </div>
                      </div>

                      <span className="sales-bar-label">
                        {month.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="admin-dashboard-card status-card">
            <div className="admin-dashboard-card-header">
              <div>
                <div className="admin-dashboard-section-icon blue">
                  <Icon name="cart" size={19} />
                </div>

                <div>
                  <h2>Order Status</h2>
                  <p>Current order pipeline</p>
                </div>
              </div>
            </div>

            <div className="status-content">
              <div
                className="status-donut"
                style={{
                  background:
                    totalStatusOrders > 0
                      ? `conic-gradient(
        #ffb84d 0% ${(orderStatuses[0].count / totalStatusOrders) * 100
                      }%,

        #45a8f5 ${(orderStatuses[0].count / totalStatusOrders) * 100
                      }% ${((orderStatuses[0].count + orderStatuses[1].count) /
                        totalStatusOrders) *
                      100
                      }%,

        #8b6df6 ${((orderStatuses[0].count + orderStatuses[1].count) /
                        totalStatusOrders) *
                      100
                      }% ${((orderStatuses[0].count +
                        orderStatuses[1].count +
                        orderStatuses[2].count) /
                        totalStatusOrders) *
                      100
                      }%,

        #ff7184 ${((orderStatuses[0].count +
                        orderStatuses[1].count +
                        orderStatuses[2].count) /
                        totalStatusOrders) *
                      100
                      }% ${((orderStatuses[0].count +
                        orderStatuses[1].count +
                        orderStatuses[2].count +
                        orderStatuses[3].count) /
                        totalStatusOrders) *
                      100
                      }%,

        #20c9a6 ${((orderStatuses[0].count +
                        orderStatuses[1].count +
                        orderStatuses[2].count +
                        orderStatuses[3].count) /
                        totalStatusOrders) *
                      100
                      }% 100%
                       )`
                      : "#dfeeed",
                }}
              >
                <div>
                  <strong>{totalStatusOrders}</strong>
                  <span>Orders</span>
                </div>
              </div>

              <div className="status-list">
                {orderStatuses.map((status) => {
                  const percentage =
                    totalStatusOrders > 0
                      ? Math.round(
                        (status.count /
                          totalStatusOrders) *
                        100
                      )
                      : 0;

                  return (
                    <div
                      className="status-item"
                      key={status.name}
                    >
                      <div className="status-item-name">
                        <span
                          className={`status-dot ${status.className}`}
                        />
                        <span>{status.name}</span>
                      </div>

                      <strong>{status.count}</strong>

                      <small>{percentage}%</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="admin-dashboard-bottom-grid">
          <section className="admin-dashboard-card recent-card">
            <div className="admin-dashboard-card-header">
              <div>
                <div className="admin-dashboard-section-icon purple">
                  <Icon name="clock" size={19} />
                </div>

                <div>
                  <h2>Recent Orders</h2>
                  <p>Your latest customer activity</p>
                </div>
              </div>

              <button
                type="button"
                className="admin-dashboard-link"
                onClick={() =>
                  navigate("/admin/orders")
                }
              >
                View All
                <Icon name="arrow" size={15} />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="admin-dashboard-empty">
                <div className="empty-icon">
                  <Icon name="cart" size={24} />
                </div>

                <h3>No orders yet</h3>

                <p>
                  New customer orders will appear here.
                </p>
              </div>
            ) : (
              <div className="recent-orders-list">
                {recentOrders.map((order) => {
                  const orderId = String(
                    order?._id || ""
                  );

                  const customer =
                    typeof order?.user_id === "object"
                      ? order.user_id?.name
                      : null;

                  const status =
                    order?.order_status ||
                    "Pending";

                  return (
                    <button
                      type="button"
                      className="recent-order-row"
                      key={orderId}
                      onClick={() =>
                        navigate(
                          `/admin/orders/${orderId}`
                        )
                      }
                    >
                      <div className="recent-order-avatar">
                        {(customer ||
                          "C")[0].toUpperCase()}
                      </div>

                      <div className="recent-order-info">
                        <strong>
                          #
                          {orderId
                            .slice(-7)
                            .toUpperCase()}
                        </strong>

                        <span>
                          {customer || "Customer"}
                        </span>
                      </div>

                      <div className="recent-order-date">
                        {formatDate(
                          order?.created_at
                        )}
                      </div>

                      <div className="recent-order-total">
                        {formatCurrency(
                          getOrderTotal(order)
                        )}
                      </div>

                      <span
                        className={`admin-dashboard-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                      <Icon
                        name="arrow"
                        size={16}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="admin-dashboard-card inventory-card">
            <div className="admin-dashboard-card-header">
              <div>
                <div className="admin-dashboard-section-icon orange">
                  <Icon name="box" size={19} />
                </div>

                <div>
                  <h2>Inventory Health</h2>
                  <p>Keep your catalog stocked</p>
                </div>
              </div>

              <button
                type="button"
                className="admin-dashboard-link"
                onClick={() =>
                  navigate("/admin/products")
                }
              >
                Products
                <Icon name="arrow" size={15} />
              </button>
            </div>

            <div className="inventory-overview">
              <div className="inventory-stat healthy">
                <div className="inventory-stat-icon">
                  <Icon name="check" size={17} />
                </div>

                <div>
                  <strong>{inventory.active}</strong>
                  <span>Active</span>
                </div>
              </div>

              <div className="inventory-stat warning">
                <div className="inventory-stat-icon">
                  <Icon name="warning" size={17} />
                </div>

                <div>
                  <strong>{inventory.lowStock}</strong>
                  <span>Low stock</span>
                </div>
              </div>

              <div className="inventory-stat danger">
                <div className="inventory-stat-icon">
                  <Icon name="warning" size={17} />
                </div>

                <div>
                  <strong>{inventory.outOfStock}</strong>
                  <span>Out of stock</span>
                </div>
              </div>
            </div>

            <div className="inventory-health-bar">
              <span
                style={{
                  width: `${products.length
                    ? (inventory.active /
                      products.length) *
                    100
                    : 0
                    }%`,
                }}
              />
            </div>

            <div className="inventory-attention">
              <div className="inventory-attention-title">
                <span>Attention required</span>

                {lowStockProducts.length > 0 && (
                  <span>
                    {lowStockProducts.length} items
                  </span>
                )}
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="inventory-empty">
                  <Icon name="check" size={18} />
                  <span>
                    All products have healthy stock levels.
                  </span>
                </div>
              ) : (
                lowStockProducts.map((product) => {
                  const stock = Number(
                    product?.stock || 0
                  );

                  return (
                    <button
                      type="button"
                      className="inventory-product-row"
                      key={product?._id}
                      onClick={() =>
                        navigate(
                          `/admin/products/${product?._id}/edit`
                        )
                      }
                    >
                      <div className="inventory-product-image">
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={
                              product?.name ||
                              "Product"
                            }
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <Icon
                            name="box"
                            size={18}
                          />
                        )}
                      </div>

                      <div className="inventory-product-name">
                        <strong>
                          {product?.name ||
                            "Unnamed Product"}
                        </strong>

                        <span>
                          {stock <= 0
                            ? "Out of stock"
                            : "Needs restocking"}
                        </span>
                      </div>

                      <span
                        className={`inventory-stock-pill ${stock <= 0 ? "out" : ""
                          }`}
                      >
                        {stock <= 0
                          ? "Out"
                          : `${stock} left`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <section className="admin-dashboard-quick-card">
          <div className="quick-card-copy">
            <div className="quick-card-icon">
              <Icon name="trend" size={22} />
            </div>

            <div>
              <strong>Keep your store moving</strong>
              <span>
                Use these shortcuts to manage your catalog and orders faster.
              </span>
            </div>
          </div>

          <div className="quick-actions">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/products/new")
              }
            >
              <Icon name="plus" size={17} />
              Add Product
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/categories")
              }
            >
              <Icon name="box" size={17} />
              Categories
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/orders")
              }
            >
              <Icon name="cart" size={17} />
              Manage Orders
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;