import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDashboardStats,
  getOrders,
  getProducts,
} from "../services/api";

import "./AdminDashboard.css";

/* =========================================================
   HELPERS
========================================================= */

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

const getStatusClass = (status) => {
  return String(status || "Pending")
    .toLowerCase()
    .replaceAll(" ", "-");
};

/*
  Supports:

  [...]
  { data: [...] }
  { data: { data: [...] } }
*/

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

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

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

        /* ================================================
           DASHBOARD STATS

           Backend response:

           {
             status: "success",
             data: {
               totalCustomers: 5,
               totalProducts: 4,
               totalOrders: 15,
               totalRevenue: 0
             }
           }

           getDashboardStats() already returns
           response.data, so statsResponse.data
           contains the actual stats object.
        ================================================ */

        const dashboardStats =
          statsResponse?.data &&
          !Array.isArray(statsResponse.data)
            ? statsResponse.data
            : statsResponse || {};

        setStats(dashboardStats);

        /* ================================================
           ORDERS
        ================================================ */

        setOrders(
          extractList(ordersResponse)
        );

        /* ================================================
           PRODUCTS
        ================================================ */

        setProducts(
          extractList(productsResponse)
        );
      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err
        );

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

  /* =======================================================
     KPI VALUES
  ======================================================= */

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

  /*
    IMPORTANT FIX:

    Backend returns:

    totalCustomers

    Previous frontend code did not check this field,
    which caused Customers to display 0.
  */

  const totalCustomers =
    stats?.totalCustomers ??
    stats?.totalUsers ??
    stats?.users ??
    stats?.userCount ??
    stats?.customers ??
    0;

  /*
    Backend currently returns totalRevenue.

    We keep the other possible names as fallbacks.
  */

  const totalSales =
    stats?.totalRevenue ??
    stats?.totalSales ??
    stats?.sales ??
    stats?.revenue ??
    0;

  /* =======================================================
     INVENTORY
  ======================================================= */

  const inventory = useMemo(() => {
    const active = products.filter(
      (product) =>
        String(
          product?.status || "Active"
        ).toLowerCase() === "active"
    ).length;

    const lowStock = products.filter(
      (product) => {
        const stock = Number(
          product?.stock || 0
        );

        return stock > 0 && stock <= 5;
      }
    ).length;

    const outOfStock =
      products.filter(
        (product) =>
          Number(
            product?.stock || 0
          ) <= 0
      ).length;

    return {
      active,
      lowStock,
      outOfStock,
    };
  }, [products]);

  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(
            b?.created_at || 0
          ) -
          new Date(
            a?.created_at || 0
          )
      )
      .slice(0, 6);
  }, [orders]);

  /* =======================================================
     LOW STOCK PRODUCTS
  ======================================================= */

  const lowStockProducts =
    useMemo(() => {
      return products
        .filter((product) => {
          const stock = Number(
            product?.stock || 0
          );

          return stock <= 5;
        })
        .sort(
          (a, b) =>
            Number(
              a?.stock || 0
            ) -
            Number(
              b?.stock || 0
            )
        )
        .slice(0, 5);
    }, [products]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-state">

          <div className="admin-dashboard-spinner" />

          <p>
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error) {
    return (
      <div className="admin-dashboard-page">

        <div className="admin-dashboard-state admin-dashboard-error">

          <div className="admin-dashboard-state-icon">
            !
          </div>

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div className="admin-dashboard-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="admin-dashboard-header">

        <div>

          <p className="admin-dashboard-eyebrow">
            OVERVIEW
          </p>

          <h1>
            Dashboard
          </h1>

          <p>
            Monitor your store performance
            and daily operations.
          </p>

        </div>

        <button
          type="button"
          className="admin-dashboard-primary-button"
          onClick={() =>
            navigate(
              "/admin/products/new"
            )
          }
        >
          + Add Product
        </button>

      </div>

      {/* ===================================================
          KPI CARDS
      =================================================== */}

      <section className="admin-dashboard-kpis">

        {/* PRODUCTS */}

        <div className="admin-dashboard-kpi">

          <div className="admin-dashboard-kpi-icon">
            ▣
          </div>

          <div>

            <span>
              Total Products
            </span>

            <strong>
              {totalProducts}
            </strong>

          </div>

        </div>

        {/* ORDERS */}

        <div className="admin-dashboard-kpi">

          <div className="admin-dashboard-kpi-icon">
            ◫
          </div>

          <div>

            <span>
              Total Orders
            </span>

            <strong>
              {totalOrders}
            </strong>

          </div>

        </div>

        {/* CUSTOMERS */}

        <div className="admin-dashboard-kpi">

          <div className="admin-dashboard-kpi-icon">
            ◉
          </div>

          <div>

            <span>
              Customers
            </span>

            <strong>
              {totalCustomers}
            </strong>

          </div>

        </div>

        {/* SALES */}

        <div className="admin-dashboard-kpi">

          <div className="admin-dashboard-kpi-icon">
            ₹
          </div>

          <div>

            <span>
              Total Sales
            </span>

            <strong>
              {formatCurrency(
                totalSales
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="admin-dashboard-grid">

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="admin-dashboard-card admin-recent-orders">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Recent Orders
              </h2>

              <p>
                Latest orders placed by customers
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              View All
            </button>

          </div>

          {recentOrders.length === 0 ? (

            <div className="admin-dashboard-empty">

              <div>
                ◫
              </div>

              <h3>
                No orders yet
              </h3>

              <p>
                Orders will appear here when
                customers place them.
              </p>

            </div>

          ) : (

            <div className="admin-recent-orders-list">

              {recentOrders.map(
                (order) => {

                  const orderId =
                    String(
                      order?._id || ""
                    );

                  const customer =
                    typeof order?.user_id ===
                    "object"
                      ? order.user_id?.name
                      : null;

                  return (
                    <button
                      type="button"
                      className="admin-recent-order-row"
                      key={
                        order?._id
                      }
                      onClick={() =>
                        navigate(
                          `/admin/orders/${orderId}`
                        )
                      }
                    >

                      <div className="admin-recent-order-icon">
                        ◫
                      </div>

                      <div className="admin-recent-order-info">

                        <strong>
                          #
                          {orderId
                            .slice(-8)
                            .toUpperCase()}
                        </strong>

                        <span>
                          {customer ||
                            "Customer"}{" "}
                          ·{" "}
                          {formatDate(
                            order?.created_at
                          )}
                        </span>

                      </div>

                      <div className="admin-recent-order-right">

                        <strong>
                          {formatCurrency(
                            order?.total_amount
                          )}
                        </strong>

                        <span
                          className={`admin-dashboard-status ${getStatusClass(
                            order?.order_status
                          )}`}
                        >
                          {order?.order_status ||
                            "Pending"}
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            INVENTORY
        ================================================= */}

        <section className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Inventory Overview
              </h2>

              <p>
                Current product availability
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
            >
              Products
            </button>

          </div>

          <div className="admin-inventory-stats">

            <div>
              <span>
                Active
              </span>

              <strong>
                {inventory.active}
              </strong>
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {inventory.lowStock}
              </strong>
            </div>

            <div>
              <span>
                Out of Stock
              </span>

              <strong>
                {inventory.outOfStock}
              </strong>
            </div>

          </div>

          <div className="admin-stock-list">

            <div className="admin-stock-list-header">
              <span>
                Attention Required
              </span>
            </div>

            {lowStockProducts.length ===
            0 ? (

              <div className="admin-stock-empty">

                <span>
                  ✓
                </span>

                <p>
                  All products currently
                  have healthy stock levels.
                </p>

              </div>

            ) : (

              lowStockProducts.map(
                (product) => (

                  <button
                    type="button"
                    className="admin-stock-row"
                    key={
                      product?._id
                    }
                    onClick={() =>
                      navigate(
                        `/admin/products/${product?._id}/edit`
                      )
                    }
                  >

                    <div className="admin-stock-product">

                      <div className="admin-stock-image">

                        {product?.image ? (

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product?.name ||
                              "Product"
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <span>
                            📦
                          </span>

                        )}

                      </div>

                      <div>

                        <strong>
                          {product?.name ||
                            "Unnamed Product"}
                        </strong>

                        <span>
                          {Number(
                            product?.stock ||
                              0
                          ) <= 0
                            ? "Out of stock"
                            : "Low stock"}
                        </span>

                      </div>

                    </div>

                    <span
                      className={`admin-stock-number ${
                        Number(
                          product?.stock ||
                            0
                        ) <= 0
                          ? "out"
                          : ""
                      }`}
                    >
                      {Number(
                        product?.stock ||
                          0
                      )}
                    </span>

                  </button>

                )
              )

            )}

          </div>

        </section>

      </div>

      {/* ===================================================
          QUICK ACTIONS
      =================================================== */}

      <section className="admin-dashboard-card admin-quick-actions">

        <div className="admin-dashboard-card-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Common store management tasks
            </p>

          </div>

        </div>

        <div className="admin-quick-actions-grid">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products/new"
              )
            }
          >

            <span>
              ＋
            </span>

            <div>

              <strong>
                Add Product
              </strong>

              <small>
                Create a new product
              </small>

            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >

            <span>
              ▣
            </span>

            <div>

              <strong>
                Manage Products
              </strong>

              <small>
                View and edit your catalog
              </small>

            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/categories"
              )
            }
          >

            <span>
              ☷
            </span>

            <div>

              <strong>
                Categories
              </strong>

              <small>
                Organize your catalog
              </small>

            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
          >

            <span>
              ◫
            </span>

            <div>

              <strong>
                Manage Orders
              </strong>

              <small>
                Review and update orders
              </small>

            </div>

          </button>

        </div>

      </section>

    </div>
  );
};

export default AdminDashboard;