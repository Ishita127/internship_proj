import { useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect admin area on the frontend.
  // Backend RBAC remains the real security layer.
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    if (location.pathname === "/admin") {
      return {
        eyebrow: "ADMINISTRATION",
        title: "Dashboard",
      };
    }

    if (location.pathname.startsWith("/admin/products")) {
      return {
        eyebrow: "CATALOG",
        title: "Products",
      };
    }

    if (location.pathname.startsWith("/admin/categories")) {
      return {
        eyebrow: "CATALOG",
        title: "Categories",
      };
    }

    if (location.pathname.startsWith("/admin/orders")) {
      return {
        eyebrow: "SALES",
        title: "Orders",
      };
    }

    if (location.pathname.startsWith("/admin/customers")) {
      return {
        eyebrow: "CUSTOMERS",
        title: "Customers",
      };
    }

    return {
      eyebrow: "ADMINISTRATION",
      title: "Shopverse Management",
    };
  };

  const page = getPageTitle();

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close admin navigation"
          onClick={closeSidebar}
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <Link to="/admin" onClick={closeSidebar}>
            SHOP<span>VERSE</span>
          </Link>
          <small>ADMIN PANEL</small>
        </div>

        <nav className="admin-navigation">
          <div className="admin-nav-section">
            <span className="admin-nav-label">OVERVIEW</span>

            <NavLink
              to="/admin"
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-icon">▦</span>
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">CATALOG</span>

            <NavLink
              to="/admin/products"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-icon">□</span>
              <span>Products</span>
            </NavLink>

            <NavLink
              to="/admin/categories"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-icon">▤</span>
              <span>Categories</span>
            </NavLink>
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">SALES</span>

            <NavLink
              to="/admin/orders"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-icon">▣</span>
              <span>Orders</span>
            </NavLink>
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">CUSTOMERS</span>

            <NavLink
              to="/admin/customers"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-icon">♙</span>
              <span>Customers</span>
            </NavLink>
          </div>
        </nav>

        {/* Sidebar bottom */}
        <div className="admin-sidebar-bottom">
          <Link
            to="/"
            className="admin-store-link"
            onClick={closeSidebar}
          >
            <span>←</span>
            <span>View Store</span>
          </Link>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN ==================== */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
            >
              ☰
            </button>

            <div className="admin-page-heading">
              <span>{page.eyebrow}</span>
              <h2>{page.title}</h2>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Notifications"
            >
              ♢
            </button>

            <div className="admin-account">
              <div className="admin-account-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="admin-account-info">
                <strong>{user.name || "Admin"}</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;