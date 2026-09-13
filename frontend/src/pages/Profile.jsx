import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the current user's profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/profile");
        const profile = response.data?.data || response.data;

        setFormData({
          name: profile?.name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Update form fields when the user edits their profile
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
  };

  // Save the updated profile information
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Address is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/users/profile", {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      const updatedUser =
        response.data?.data || response.data;

      const userData = {
        ...(user || {}),
        ...(updatedUser || {}),
        name: updatedUser?.name || formData.name.trim(),
        phone: updatedUser?.phone || formData.phone.trim(),
        address:
          updatedUser?.address || formData.address.trim(),
      };

      updateUser(userData);

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      setSuccess(
        "Your profile has been updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Display loading state while the profile is being fetched
  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-loader"></div>
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <span className="profile-eyebrow">
              MY ACCOUNT
            </span>

            <h1>Profile</h1>

            <p>
              Manage your personal information and account details.
            </p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Profile navigation */}

          <aside className="profile-sidebar">
            <div className="profile-avatar">
              {formData.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <h2>
              {formData.name || "Customer"}
            </h2>

            <p>{formData.email}</p>

            <nav className="profile-nav">
              <Link
                to="/profile"
                className="profile-nav-link active"
              >
                <span>👤</span>
                Profile
              </Link>

              <Link
                to="/orders"
                className="profile-nav-link"
              >
                <span>📦</span>
                My Orders
              </Link>

              <Link
                to="/wishlist"
                className="profile-nav-link"
              >
                <span>♡</span>
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="profile-nav-link"
              >
                <span>🛒</span>
                Cart
              </Link>
            </nav>

            <button
              type="button"
              className="profile-logout"
              onClick={logout}
            >
              Logout
            </button>
          </aside>

          {/* Profile information form */}

          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Personal Information</h2>

                <p>
                  Keep your account information up to date.
                </p>
              </div>
            </div>

            {error && (
              <div className="profile-alert error">
                {error}
              </div>
            )}

            {success && (
              <div className="profile-alert success">
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="profile-form"
            >
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />

                  <small>
                    Email cannot be changed here.
                  </small>
                </div>

                <div className="profile-field">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="address">
                    Delivery Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows="4"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your complete delivery address"
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Profile;