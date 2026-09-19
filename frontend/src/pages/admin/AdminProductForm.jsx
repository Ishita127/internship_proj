import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getCategories,
  getProductById,
  updateProduct,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./AdminProductForm.css";

const initialForm = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  discount: "0",
  stock: "0",
  image: "",
  status: "Active",
};

const AdminProductForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFormData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const categoriesResponse = await getCategories();

      const categoryData = Array.isArray(categoriesResponse)
        ? categoriesResponse
        : categoriesResponse?.data || [];

      setCategories(categoryData);

      if (isEditMode) {
        const productResponse = await getProductById(id);
        const product = productResponse?.data || productResponse;

        const categoryId =
          typeof product?.category_id === "object"
            ? product?.category_id?._id || product?.category_id?.id || ""
            : product?.category_id || "";

        setFormData({
          name: product?.name || "",
          description: product?.description || "",
          category_id: categoryId,
          price: product?.price ?? "",
          discount: product?.discount ?? 0,
          stock: product?.stock ?? 0,
          image: product?.image || "",
          status: product?.status || "Active",
        });
      }
    } catch (err) {
      console.error("Failed to load product form:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load product information."
      );
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadFormData();
  }, [user, navigate, loadFormData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (!formData.category_id) {
      return "Please select a category.";
    }

    if (formData.price === "" || Number(formData.price) < 0) {
      return "Please enter a valid price.";
    }

    if (
      formData.discount === "" ||
      Number(formData.discount) < 0 ||
      Number(formData.discount) > 100
    ) {
      return "Discount must be between 0 and 100.";
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      return "Stock cannot be negative.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category_id: formData.category_id,
      price: Number(formData.price),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      image: formData.image.trim(),
      status: formData.status,
    };

    try {
      if (isEditMode) {
        await updateProduct(id, productData);
        setSuccess("Product updated successfully.");
      } else {
        await createProduct(productData);
        setSuccess("Product created successfully.");
      }

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (err) {
      console.error("Failed to save product:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-product-form-page">
        <div className="admin-form-loading">
          <div className="admin-form-spinner" />
          <p>Loading product...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-product-form-page">
      <div className="admin-form-header">
        <div>
          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/admin/products")}
          >
            ← Back to Products
          </button>

          <p className="admin-section-eyebrow">
            {isEditMode ? "PRODUCT MANAGEMENT" : "CATALOG MANAGEMENT"}
          </p>

          <h1>{isEditMode ? "Edit Product" : "Add Product"}</h1>

          <p>
            {isEditMode
              ? "Update product information, pricing and inventory."
              : "Add a new product to your store catalog."}
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-form-alert error">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="admin-form-alert success">
          <span>✓</span>
          <p>{success}</p>
        </div>
      )}

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <div>
              <h2>Basic Information</h2>
              <p>Enter the main details of your product.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-field full">
              <label htmlFor="name">
                Product Name <span>*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Premium Cotton Shirt"
                maxLength={150}
              />
            </div>

            <div className="admin-form-field full">
              <label htmlFor="description">
                Description <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows={5}
                maxLength={2000}
              />

              <small>{formData.description.length}/2000 characters</small>
            </div>

            <div className="admin-form-field">
              <label htmlFor="category_id">
                Category <span>*</span>
              </label>

              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Select category</option>

                {categories.map((category) => {
                  const categoryId = category._id || category.id;

                  return (
                    <option key={categoryId} value={categoryId}>
                      {category.category_name || category.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="status">Status</label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <div>
              <h2>Pricing & Inventory</h2>
              <p>Control pricing, discounts and available stock.</p>
            </div>
          </div>

          <div className="admin-form-grid three">
            <div className="admin-form-field">
              <label htmlFor="price">
                Price <span>*</span>
              </label>

              <div className="admin-input-prefix">
                <span>₹</span>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label htmlFor="discount">Discount (%)</label>

              <div className="admin-input-suffix">
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                />

                <span>%</span>
              </div>
            </div>

            <div className="admin-form-field">
              <label htmlFor="stock">Stock Quantity</label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <div>
              <h2>Product Image</h2>
              <p>Provide the public URL for the product image.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-field full">
              <label htmlFor="image">Image URL</label>

              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
              />

              <small>
                Use a publicly accessible image URL. Leave empty if no image
                is available.
              </small>
            </div>
          </div>

          {formData.image && (
            <div className="admin-image-preview">
              <img
                src={formData.image}
                alt="Product preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-form-cancel"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-form-save"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditMode
              ? "Save Changes"
              : "Create Product"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminProductForm;