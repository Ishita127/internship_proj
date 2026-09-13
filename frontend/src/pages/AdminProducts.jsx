import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteProduct,
  getCategories,
  getProducts,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AdminProducts.css";

const AdminProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      const productData = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.data || [];

      const categoryData = Array.isArray(categoriesResponse)
        ? categoriesResponse
        : categoriesResponse?.data || [];

      setProducts(productData);
      setCategories(categoryData);
    } catch (err) {
      console.error("Failed to load admin products:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadData();
  }, [user, navigate, loadData]);

  const getCategoryId = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      return category._id || category.id || "";
    }

    return category;
  };

  const getCategoryName = (categoryId) => {
    const normalizedCategoryId = getCategoryId(categoryId);

    if (!normalizedCategoryId) {
      return "Uncategorized";
    }

    const category = categories.find(
      (item) =>
        String(item._id || item.id) === String(normalizedCategoryId)
    );

    if (category) {
      return category.category_name || category.name || "Uncategorized";
    }

    if (typeof categoryId === "object") {
      return (
        categoryId.category_name ||
        categoryId.name ||
        "Uncategorized"
      );
    }

    return "Uncategorized";
  };

  const getProductStatus = (product) => {
    if (product.status === "Inactive") return "Inactive";

    if (Number(product.stock) <= 0) {
      return "Out of Stock";
    }

    return "Active";
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase().trim();

      const productName = product.name?.toLowerCase() || "";

      const productDescription =
        product.description?.toLowerCase() || "";

      const categoryName =
        getCategoryName(product.category_id)?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        productName.includes(searchValue) ||
        productDescription.includes(searchValue) ||
        categoryName.includes(searchValue);

      const productCategoryId = getCategoryId(product.category_id);

      const matchesCategory =
        categoryFilter === "all" ||
        String(productCategoryId) === String(categoryFilter);

      const status = getProductStatus(product);

      const matchesStatus =
        statusFilter === "all" ||
        status.toLowerCase().replaceAll(" ", "-") === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter, categories]);

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const clearAllFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setError("");

    try {
      await deleteProduct(deleteId);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            String(product._id || product.id) !== String(deleteId)
        )
      );

      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete product:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-products-page">
        <div className="admin-products-loading">
          <div className="admin-loading-spinner" />
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <p className="admin-section-eyebrow">CATALOG MANAGEMENT</p>

          <h1>Products</h1>

          <p className="admin-products-subtitle">
            Manage your store products, pricing, inventory and availability.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => navigate("/admin/products/new")}
        >
          <span>+</span>
          Add Product
        </button>
      </div>

      {error && (
        <div className="admin-products-error">
          <span>!</span>
          <p>{error}</p>

          <button type="button" onClick={loadData}>
            Retry
          </button>
        </div>
      )}

      <div className="admin-product-summary">
        <div className="admin-summary-item">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>

        <div className="admin-summary-item">
          <span>Active</span>
          <strong>
            {
              products.filter(
                (product) => getProductStatus(product) === "Active"
              ).length
            }
          </strong>
        </div>

        <div className="admin-summary-item">
          <span>Low Stock</span>
          <strong>
            {
              products.filter(
                (product) =>
                  Number(product.stock) > 0 &&
                  Number(product.stock) <= 5
              ).length
            }
          </strong>
        </div>

        <div className="admin-summary-item">
          <span>Out of Stock</span>
          <strong>
            {
              products.filter(
                (product) => Number(product.stock) <= 0
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-product-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All Categories</option>

          {categories.map((category) => {
            const categoryId = category._id || category.id;

            return (
              <option key={categoryId} value={categoryId}>
                {category.category_name || category.name}
              </option>
            );
          })}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        {(search ||
          categoryFilter !== "all" ||
          statusFilter !== "all") && (
          <button
            type="button"
            className="admin-clear-filters-button"
            onClick={clearAllFilters}
          >
            Clear All
          </button>
        )}

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadData}
          title="Refresh products"
        >
          ↻
        </button>
      </div>

      <div className="admin-products-card">
        <div className="admin-products-table-wrapper">
          <table className="admin-products-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>DISCOUNT</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="admin-products-empty">
                      <div className="admin-empty-icon">□</div>

                      <h3>No products found</h3>

                      <p>
                        Try changing your search or filters, or add a
                        new product.
                      </p>

                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={clearAllFilters}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const productId = product._id || product.id;
                  const status = getProductStatus(product);

                  return (
                    <tr key={productId}>
                      <td>
                        <div className="admin-product-cell">
                          <div className="admin-product-image">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                onError={(event) => {
                                  event.currentTarget.style.display =
                                    "none";

                                  event.currentTarget.parentElement.classList.add(
                                    "image-error"
                                  );
                                }}
                              />
                            ) : (
                              <span>IMG</span>
                            )}
                          </div>

                          <div className="admin-product-info">
                            <strong>{product.name}</strong>

                            <small>
                              ID: {String(productId).slice(-8)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-text">
                          {getCategoryName(product.category_id)}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-price">
                          {formatPrice(product.price)}
                        </strong>
                      </td>

                      <td>
                        {Number(product.discount || 0) > 0 ? (
                          <span className="admin-discount">
                            {product.discount}%
                          </span>
                        ) : (
                          <span className="admin-no-discount">—</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-stock ${
                            Number(product.stock) <= 0
                              ? "out"
                              : Number(product.stock) <= 5
                              ? "low"
                              : "good"
                          }`}
                        >
                          {product.stock ?? 0}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-status ${status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          <span className="admin-status-dot" />
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            className="admin-action-button edit"
                            title="Edit product"
                            onClick={() =>
                              navigate(
                                `/admin/products/${productId}/edit`
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-action-button delete"
                            title="Delete product"
                            onClick={() => setDeleteId(productId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 0 && (
          <div className="admin-products-footer">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </span>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="admin-modal-backdrop">
          <div className="admin-delete-modal">
            <div className="admin-delete-icon">!</div>

            <h2>Delete product?</h2>

            <p>
              This action will permanently remove this product from
              your catalog. This cannot be undone.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-modal-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminProducts;