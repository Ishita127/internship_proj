import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      navigate(`/shop?search=${encodeURIComponent(trimmedSearch)}`);
    } else {
      navigate("/shop");
    }

    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          SHOP<span>VERSE</span>
        </Link>

        {/* Navigation */}
        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/about">About</Link>
        </nav>

        {/* Right Side Actions */}
        <div className="navbar-actions">

          {/* Search */}
          <button
            className="nav-icon"
            aria-label="Search"
            onClick={() => setSearchOpen((current) => !current)}
          >
            🔍
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="nav-icon"
            aria-label="Wishlist"
          >
            ♡
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="nav-cart"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            🛒
            <span>{cartCount}</span>
          </Link>

          {/* Authentication */}
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                Hi, {user?.name || "Customer"}
              </span>

              <Link to="/profile" className="navbar-profile-link">
                Profile
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" className="navbar-admin-link">
                  Admin Panel
                </Link>
              )}
              <button
                type="button"
                className="login-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="login-button"
            >
              Sign In
            </Link>
          )}

        </div>

      </div>

      {/* Navbar Search */}
      {searchOpen && (
        <form
          className="navbar-search"
          onSubmit={handleSearch}
        >
          <div className="container">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />

            <button type="submit">
              Search
            </button>
          </div>
        </form>
      )}
    </header>
  );
}

export default Navbar;