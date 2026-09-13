import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate("/");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Invalid email or password. Please try again.";

      setError(message);
    }
  };

  return (
    <main className="login-page">

      {/* Left Side */}
      <section className="login-showcase">
        <div className="login-showcase-content">

          <span className="login-label">
            WELCOME TO SHOPVERSE
          </span>

          <h1>
            Better shopping.
            <br />
            Better everyday.
          </h1>

          <p>
            Discover carefully selected products for modern
            everyday living.
          </p>

          <div className="login-benefits">

            <div>
              <span>✓</span>
              <p>Quality products</p>
            </div>

            <div>
              <span>✓</span>
              <p>Fast & reliable delivery</p>
            </div>

            <div>
              <span>✓</span>
              <p>Secure checkout</p>
            </div>

          </div>

        </div>
      </section>

      {/* Right Side */}
      <section className="login-form-section">

        <div className="login-form-container">

          <div className="login-heading">

            <span className="login-label">
              ACCOUNT
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue shopping with ShopVerse.
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

            {/* Password */}
            <div className="form-group">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="password-input-wrapper">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* Remember */}
            <label className="remember-me">

              <input
                type="checkbox"
              />

              <span>
                Remember me
              </span>

            </label>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>

          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="signup-prompt">

            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Create an account
            </Link>

          </div>

          <Link
            to="/"
            className="back-home"
          >
            ← Back to ShopVerse
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Login;