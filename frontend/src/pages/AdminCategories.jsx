import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AdminCategories.css";

const AdminCategories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCategories();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await createCategory({
        category_name: trimmedName,
        description: trimmedDescription,
      });

      const createdCategory = response?.data || response;

      if (createdCategory) {
        setCategories((current) => [...current, createdCategory]);
      } else {
        await loadCategories();
      }

      setName("");
      setDescription("");
      setSuccess("Category created successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to create category:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create category."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const categoryName =
      category.category_name ||
      category.name ||
      "";

    return categoryName
      .toLowerCase()
      .includes(search.toLowerCase().trim());
  });

  if (loading) {
    return (
      <section className="admin-categories-page">
        <div className="admin-categories-loading">
          <div className="admin-categories-spinner" />
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-categories-page">
      {/* HEADER */}

      <div className="admin-categories-header">
        <div>
          <p className="admin-section-eyebrow">
            CATALOG MANAGEMENT
          </p>

          <h1>Categories</h1>

          <p>
            Organize your products into clear, manageable categories.
          </p>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="admin-category-alert error">
          <span>!</span>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="admin-category-alert success">
          <span>✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* CONTENT */}

      <div className="admin-categories-layout">
        {/* CREATE CATEGORY */}

        <div className="admin-category-form-card">
          <div className="admin-category-card-header">
            <p>NEW CATEGORY</p>
            <h2>Add Category</h2>
            <span>
              Create a category for organizing your products.
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-category-field">
              <label htmlFor="category-name">
                Category Name <span>*</span>
              </label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="e.g. Men's Clothing"
                maxLength={100}
              />
            </div>

            <div className="admin-category-field">
              <label htmlFor="category-description">
                Description
              </label>

              <textarea
                id="category-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setError("");
                }}
                placeholder="Brief description of this category..."
                rows={5}
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              className="admin-category-create-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* CATEGORY LIST */}

        <div className="admin-category-list-card">
          <div className="admin-category-list-header">
            <div>
              <p>CATALOG</p>
              <h2>All Categories</h2>
            </div>

            <span className="admin-category-count">
              {categories.length}
            </span>
          </div>

          <div className="admin-category-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="admin-category-list">
            {filteredCategories.length === 0 ? (
              <div className="admin-category-empty">
                <div>▤</div>

                <h3>
                  {categories.length === 0
                    ? "No categories yet"
                    : "No categories found"}
                </h3>

                <p>
                  {categories.length === 0
                    ? "Create your first category using the form."
                    : "Try a different search term."}
                </p>
              </div>
            ) : (
              filteredCategories.map((category, index) => {
                const categoryId =
                  category._id || category.id;

                return (
                  <div
                    className="admin-category-row"
                    key={categoryId || index}
                  >
                    <div className="admin-category-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="admin-category-info">
                      <strong>
                        {category.category_name ||
                          category.name ||
                          "Unnamed Category"}
                      </strong>

                      <span>
                        {category.description ||
                          "No description provided"}
                      </span>
                    </div>

                    <div className="admin-category-id">
                      {categoryId
                        ? String(categoryId).slice(-8)
                        : "—"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminCategories;