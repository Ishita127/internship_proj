import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/api";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(trimmedEmail);

      setSuccess(
        response?.message ||
          "Password reset instructions have been sent to your email."
      );

      setEmail("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send password reset instructions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-showcase">
        <div className="forgot-password-showcase-content">
          <span className="forgot-password-label">
            ACCOUNT RECOVERY
          </span>

          <h1>
            A fresh
            <br />
            start.
          </h1>

          <p>
            Forgot your password? No worries. Enter the email
            associated with your ShopVerse account and we'll help
            you get back in.
          </p>

          <div className="forgot-password-benefits">
            <div>
              <span>01</span>
              <p>Secure password recovery</p>
            </div>

            <div>
              <span>02</span>
              <p>Reset link sent to your email</p>
            </div>

            <div>
              <span>03</span>
              <p>Get back to shopping quickly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="forgot-password-form-section">
        <div className="forgot-password-form-container">
          <div className="forgot-password-heading">
            <span>RECOVER ACCOUNT</span>

            <h2>Forgot password?</h2>

            <p>
              Enter your email address and we'll send you a
              password reset link.
            </p>
          </div>

          <form
            className="forgot-password-form"
            onSubmit={handleSubmit}
          >
            <div className="forgot-password-form-group">
              <label htmlFor="forgot-email">
                Email address
              </label>

              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="forgot-password-error">
                {error}
              </div>
            )}

            {success && (
              <div className="forgot-password-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="forgot-password-submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="forgot-password-divider">
            <span>OR</span>
          </div>

          <Link
            to="/login"
            className="forgot-password-back-login"
          >
            ← Back to login
          </Link>

          <Link
            to="/"
            className="forgot-password-back-home"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;