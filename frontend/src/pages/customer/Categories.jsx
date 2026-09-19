import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getCategories } from "../../services/api";

import "./Categories.css";

// Fallback icons are used when a category does not have an image.
const categoryIcons = [
  "✦",
  "⌁",
  "⌂",
  "✧",
  "◈",
  "◇",
];

// Get a consistent ID from the backend category object.
function getId(item) {
  return item?._id || item?.id || "";
}

// Handle the different response shapes that the API may return.
function extractList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

function Categories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load categories from the backend.
  const loadCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCategories();
      const categoryList = extractList(response);

      setCategories(categoryList);
    } catch (err) {
      console.error("Categories loading error:", err);

      setCategories([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load categories right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Normalize category data before rendering it.
  const categoryList = useMemo(() => {
    return categories.map((category, index) => ({
      id: getId(category),

      name:
        category?.category_name ||
        category?.name ||
        "Category",

      description:
        category?.description ||
        "Explore products from this collection.",

      image: category?.image || "",

      icon: categoryIcons[index % categoryIcons.length],
    }));
  }, [categories]);

  return (
    <main className="categories-page">
      {/* Hero section */}
      <section className="categories-hero">
        <div className="container categories-hero-content">
          <span className="categories-label">
            SHOP BY CATEGORY
          </span>

          <h1>
            Find what
            <br />
            fits your life.
          </h1>

          <p>
            Explore our carefully selected categories and
            discover products designed for modern everyday living.
          </p>
        </div>
      </section>

      {/* Categories section */}
      <section className="container categories-section">
        <div className="categories-heading">
          <div>
            <span className="section-label">
              EXPLORE
            </span>

            <h2>Our Categories</h2>
          </div>

          <Link
            to="/shop"
            className="categories-view-all"
          >
            View all products →
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="categories-state">
            <div className="categories-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <p>Loading categories...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="categories-state categories-error">
            <p>{error}</p>

            <button
              type="button"
              className="categories-retry-button"
              onClick={loadCategories}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          categoryList.length === 0 && (
            <div className="categories-state">
              <p>
                No categories are available right now.
              </p>

              <Link
                to="/shop"
                className="categories-shop-button"
              >
                Browse Products →
              </Link>
            </div>
          )}

        {/* Dynamic categories */}
        {!loading &&
          !error &&
          categoryList.length > 0 && (
            <div className="categories-grid">
              {categoryList.map((category) => (
                <Link
                  key={category.id || category.name}
                  to={`/shop?category=${encodeURIComponent(
                    category.name
                  )}`}
                  className="category-card"
                >
                  <div className="category-icon">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                      />
                    ) : (
                      category.icon
                    )}
                  </div>

                  <div className="category-content">
                    <h3>{category.name}</h3>

                    <p>{category.description}</p>

                    <span className="category-link">
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>

      {/* Bottom call-to-action */}
      <section className="categories-cta">
        <div className="container categories-cta-content">
          <span className="section-label">
            SHOPVERSE COLLECTION
          </span>

          <h2>
            Something for
            <br />
            every day.
          </h2>

          <p>
            From everyday essentials to products that
            make life a little better, discover your next favorite.
          </p>

          <Link
            to="/shop"
            className="categories-shop-button"
          >
            Shop All Products →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Categories;