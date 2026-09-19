import { useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const Icon = ({ name, size = 20 }) => {
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
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),

    products: (
      <>
        <path d="m21 8-9 5-9-5 9-5 9 5Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),

    categories: (
      <>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),

    orders: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 7h6" />
        <path d="M9 11h6" />
        <path d="M9 15h4" />
      </>
    ),

    customers: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    reviews: (
      <path d="m12 3 2.78 5.63 6.22.9-4.5 4.38 1.06 6.2L12 17.18 6.44 20.1l1.06-6.2L3 9.53l6.22-.9L12 3Z" />
    ),

    store: (
      <>
        <path d="M3 10h18" />
        <path d="M5 10v10h14V10" />
        <path d="M4 10 6 4h12l2 6" />
        <path d="M9 20v-5h6v5" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),

    chevron: <path d="m9 18 6-6-6-6" />,

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent non-admin users from accessing the admin area.
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

  // Returns the heading and description shown in the admin topbar.
  const getPageTitle = () => {
    if (location.pathname === "/admin") {
      return {
        eyebrow: "ADMINISTRATION",
        title: "Dashboard",
        description:
          "Monitor your store performance and daily operations.",
      };
    }

    if (location.pathname.startsWith("/admin/products")) {
      return {
        eyebrow: "CATALOG",
        title: "Products",
        description:
          "Manage your store products and inventory.",
      };
    }

    if (location.pathname.startsWith("/admin/categories")) {
      return {
        eyebrow: "CATALOG",
        title: "Categories",
        description:
          "Organize your product catalog.",
      };
    }

    if (location.pathname.startsWith("/admin/orders")) {
      return {
        eyebrow: "SALES",
        title: "Orders",
        description:
          "Manage customer orders and fulfillment.",
      };
    }

    if (location.pathname.startsWith("/admin/customers")) {
      return {
        eyebrow: "CUSTOMERS",
        title: "Customers",
        description:
          "View and manage your customer base.",
      };
    }

    if (location.pathname.startsWith("/admin/reviews")) {
      return {
        eyebrow: "FEEDBACK",
        title: "Reviews",
        description:
          "Understand customer feedback and ratings.",
      };
    }

    return {
      eyebrow: "ADMINISTRATION",
      title: "ShopVerse Management",
      description:
        "Manage your ecommerce store.",
    };
  };

  const page = getPageTitle();

  // Keeps all sidebar navigation items consistent.
  const navItem = (to, icon, label, end = false) => (
    <NavLink
      to={to}
      end={end}
      onClick={closeSidebar}
      className={({ isActive }) =>
        `admin-nav-item ${isActive ? "active" : ""}`
      }
    >
      <span className="admin-nav-icon">
        <Icon name={icon} size={19} />
      </span>

      <span className="admin-nav-text">
        {label}
      </span>

      <span className="admin-nav-arrow">
        <Icon name="chevron" size={15} />
      </span>
    </NavLink>
  );

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close admin navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="admin-brand">
          <Link
            to="/admin"
            onClick={closeSidebar}
          >
            <span className="admin-brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span className="admin-brand-name">
              SHOP<span>VERSE</span>
            </span>
          </Link>

          <small>ADMIN CONTROL CENTER</small>
        </div>

        <nav className="admin-navigation">
          <div className="admin-nav-section">
            <span className="admin-nav-label">
              OVERVIEW
            </span>

            {navItem(
              "/admin",
              "dashboard",
              "Dashboard",
              true
            )}
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">
              CATALOG
            </span>

            {navItem(
              "/admin/products",
              "products",
              "Products"
            )}

            {navItem(
              "/admin/categories",
              "categories",
              "Categories"
            )}
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">
              SALES
            </span>

            {navItem(
              "/admin/orders",
              "orders",
              "Orders"
            )}
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">
              CUSTOMERS
            </span>

            {navItem(
              "/admin/customers",
              "customers",
              "Customers"
            )}
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">
              FEEDBACK
            </span>

            {navItem(
              "/admin/reviews",
              "reviews",
              "Reviews"
            )}
          </div>
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            <span className="admin-bottom-icon">
              <Icon name="logout" size={18} />
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
            >
              <Icon name="menu" size={21} />
            </button>

            <div className="admin-page-heading">
              <span>{page.eyebrow}</span>

              <h2>{page.title}</h2>

              <p>{page.description}</p>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Notifications"
            >
              <Icon name="bell" size={19} />
              <span className="admin-notification-dot" />
            </button>

            <div className="admin-account">
              <div className="admin-account-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="admin-account-info">
                <strong>
                  {user.name || "Admin"}
                </strong>

                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;