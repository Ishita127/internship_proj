import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./AdminCategories.css";

const AdminCategories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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

  const handleImageUrlChange = (event) => {
    const value = event.target.value;

    setImageUrl(value);
    setError("");
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (!trimmedDescription) {
      setError("Category description is required.");
      return;
    }

    if (!trimmedImageUrl) {
      setError("Please provide an image URL.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await createCategory({
        category_name: trimmedName,
        description: trimmedDescription,
        image: trimmedImageUrl,
      });

      const createdCategory = response?.data || response;

      if (createdCategory) {
        setCategories((current) => [...current, createdCategory]);
      } else {
        await loadCategories();
      }

      setName("");
      setDescription("");
      setImageUrl("");

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
      {/* Alerts */}

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

      {/* Content */}

      <div className="admin-categories-layout">
        {/* Create Category */}

        <div className="admin-category-form-card">
          <div className="admin-category-card-header">
            <p>NEW CATEGORY</p>

            <h2>Add Category</h2>

            <span>
              Create a category for organizing your products.
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Category Name */}

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

            {/* Category Description */}

            <div className="admin-category-field">
              <label htmlFor="category-description">
                Description <span>*</span>
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

            {/* Image URL */}

            <div className="admin-category-field">
              <label htmlFor="category-image-url">
                Image URL <span>*</span>
              </label>

              <input
                id="category-image-url"
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/category-image.jpg"
              />

              <small>
                Paste a publicly accessible image URL.
              </small>
            </div>

            {/* Image Preview */}

            {imageUrl.trim() && (
              <div className="admin-category-image-preview">
                <div className="admin-category-preview-header">
                  <span>IMAGE PREVIEW</span>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="Remove category image"
                  >
                    Remove
                  </button>
                </div>

                <img
                  src={imageUrl.trim()}
                  alt="Category preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    setError(
                      "Unable to load the selected image."
                    );
                  }}
                />
              </div>
            )}

            {/* Create Button */}

            <button
              type="submit"
              className="admin-category-create-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* Category List */}

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

          {/* Search */}

          <div className="admin-category-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* Categories */}

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

                const categoryImage =
                  category.image ||
                  category.image_url ||
                  category.category_image ||
                  "";

                return (
                  <div
                    className="admin-category-row"
                    key={categoryId || index}
                  >
                    {/* Number */}

                    <div className="admin-category-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Image */}

                    <div className="admin-category-image">
                      {categoryImage ? (
                        <img
                          src={categoryImage}
                          alt={
                            category.category_name ||
                            category.name ||
                            "Category"
                          }
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span>▤</span>
                      )}
                    </div>

                    {/* Information */}

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

                    {/* ID */}

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