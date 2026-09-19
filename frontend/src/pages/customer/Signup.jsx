import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((currentData) => ({
      ...currentData,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      });

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to create your account. Please try again.";

      setError(message);
    }
  };

  return (
    <main className="signup-page">

      {/* Left Section */}
      <section className="signup-left">

        <div className="signup-left-content">

          <span className="signup-label">
            WELCOME TO SHOPVERSE
          </span>

          <h1>
            Start your
            <br />
            shopping journey.
          </h1>

          <p>
            Create an account and discover carefully
            selected products for modern everyday living.
          </p>

          <div className="signup-benefits">

            <div className="signup-benefit">
              <span>✓</span>
              <p>Quality products</p>
            </div>

            <div className="signup-benefit">
              <span>✓</span>
              <p>Fast & reliable delivery</p>
            </div>

            <div className="signup-benefit">
              <span>✓</span>
              <p>Secure checkout</p>
            </div>

          </div>

        </div>

      </section>

      {/* Right Section */}
      <section className="signup-right">

        <div className="signup-form-container">

          <h2>
            Create an account
          </h2>

          <p className="signup-subtitle">
            Join ShopVerse and start shopping today.
          </p>

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          {success && (
            <div className="signup-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="signup-field">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />

            </div>

            {/* Email */}
            <div className="signup-field">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

            {/* Phone */}
            <div className="signup-field">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />

            </div>

            {/* Address */}
            <div className="signup-field">

              <label htmlFor="address">
                Address
              </label>

              <input
                id="address"
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                autoComplete="street-address"
              />

            </div>

            {/* Password */}
            <div className="signup-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

            </div>

            {/* Confirm Password */}
            <div className="signup-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />

            </div>

            {/* Terms */}
            <div className="signup-terms">

              <input
                type="checkbox"
                id="terms"
                required
              />

              <label htmlFor="terms">
                I agree to the Terms & Conditions
              </label>

            </div>

            {/* Button */}
            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account →"}
            </button>

          </form>

          <div className="signup-divider">
            <span>OR</span>
          </div>

          <p className="signup-login-text">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>

          <Link
            to="/"
            className="signup-back"
          >
            ← Back to ShopVerse
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Signup;