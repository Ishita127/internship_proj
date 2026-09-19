import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/api";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(token, password);

      setSuccess(
        response?.message ||
          "Your password has been successfully updated."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to reset your password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <section className="reset-password-showcase">
        <div className="reset-password-showcase-content">
          <span className="reset-password-label">
            ACCOUNT SECURITY
          </span>

          <h1>
            New
            <br />
            password.
          </h1>

          <p>
            Create a new password for your ShopVerse account.
            Once updated, you'll be able to sign in normally
            again.
          </p>

          <div className="reset-password-benefits">
            <div>
              <span>01</span>
              <p>Choose a secure password</p>
            </div>

            <div>
              <span>02</span>
              <p>Confirm your new password</p>
            </div>

            <div>
              <span>03</span>
              <p>Return securely to your account</p>
            </div>
          </div>
        </div>
      </section>

      <section className="reset-password-form-section">
        <div className="reset-password-form-container">
          <div className="reset-password-heading">
            <span>RESET ACCOUNT</span>

            <h2>Set new password</h2>

            <p>
              Enter and confirm your new password below.
            </p>
          </div>

          <form
            className="reset-password-form"
            onSubmit={handleSubmit}
          >
            <div className="reset-password-form-group">
              <label htmlFor="new-password">
                New password
              </label>

              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="reset-password-form-group">
              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="reset-password-error">
                {error}
              </div>
            )}

            {success && (
              <div className="reset-password-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="reset-password-submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="reset-password-divider">
            <span>OR</span>
          </div>

          <Link
            to="/login"
            className="reset-password-back-login"
          >
            ← Back to login
          </Link>

          <Link
            to="/"
            className="reset-password-back-home"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;