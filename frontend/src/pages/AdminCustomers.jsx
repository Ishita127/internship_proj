import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../services/api";

import "./AdminCustomers.css";

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers();

        const userData = response?.data ?? response;

        setUsers(Array.isArray(userData) ? userData : []);
      } catch (err) {
        console.error("Failed to load customers:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load customers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user?.name?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        user?.phone?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        user?.role?.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const customerCount = users.filter(
    (user) => user?.role?.toLowerCase() === "customer"
  ).length;

  const adminCount = users.filter(
    (user) => user?.role?.toLowerCase() === "admin"
  ).length;

  const getInitial = (name) => {
    return (name || "U").charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="admin-customers-page">
        <div className="admin-customers-state">
          <div className="admin-customers-spinner" />
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customers-page">
        <div className="admin-customers-state admin-customers-error">
          <div className="admin-state-icon">!</div>
          <h2>Unable to load customers</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      {/* HEADER */}
      <div className="admin-customers-header">
        <div>
          <p className="admin-customers-eyebrow">
            CUSTOMERS
          </p>

          <h1>Customers</h1>

          <p>
            View and manage customers registered on your
            store.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="admin-customers-summary">
        <div className="admin-customer-stat">
          <div className="admin-customer-stat-icon">
            👥
          </div>

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="admin-customer-stat">
          <div className="admin-customer-stat-icon">
            👤
          </div>

          <div>
            <span>Customers</span>
            <strong>{customerCount}</strong>
          </div>
        </div>

        <div className="admin-customer-stat">
          <div className="admin-customer-stat-icon">
            ◈
          </div>

          <div>
            <span>Administrators</span>
            <strong>{adminCount}</strong>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <section className="admin-customers-card">
        <div className="admin-customers-toolbar">
          <div className="admin-customers-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="admin-customers-results">
          Showing{" "}
          <strong>{filteredUsers.length}</strong>{" "}
          of <strong>{users.length}</strong> users
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-customers-empty">
            <div className="admin-empty-icon">⌕</div>

            <h2>No customers found</h2>

            <p>
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="admin-customers-table-wrapper">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-customer-cell">
                        <div className="admin-customer-avatar">
                          {getInitial(user.name)}
                        </div>

                        <div>
                          <strong>
                            {user.name || "Unnamed User"}
                          </strong>

                          <span>
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-customer-email">
                        {user.email || "—"}
                      </span>
                    </td>

                    <td>
                      {user.phone || "—"}
                    </td>

                    <td>
                      <span className="admin-customer-address">
                        {user.address || "No address"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-role-badge ${
                          user?.role?.toLowerCase() ===
                          "admin"
                            ? "admin"
                            : "customer"
                        }`}
                      >
                        {user.role || "customer"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCustomers;