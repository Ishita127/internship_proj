import { useEffect, useMemo, useState } from "react";
import { getProductReviews, getProducts, getCategories } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminReviews.css";

const AdminReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [view, setView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([getProducts(), getCategories()]);

        const productData = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse?.data || [];

        const categoryData = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse?.data || [];

        setProducts(productData);
        setCategories(categoryData);

        const reviewResults = await Promise.all(
          productData.map(async (product) => {
            const productId = product?._id || product?.id;

            if (!productId) {
              return [];
            }

            try {
              const response = await getProductReviews(productId);

              const productReviews = Array.isArray(response)
                ? response
                : response?.data || [];

              return productReviews.map((review) => ({
                ...review,
                product_id: productId,
                product_name: product.name || "Unknown Product",
                product_image: product.image || "",
                category_id:
                  typeof product.category_id === "object"
                    ? product.category_id?._id || ""
                    : product.category_id || "",
              }));
            } catch (reviewError) {
              console.error(
                `Failed to load reviews for ${product.name}:`,
                reviewError
              );

              return [];
            }
          })
        );

        setReviews(reviewResults.flat());
      } catch (err) {
        console.error("Failed to load admin reviews:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [user, navigate]);

  const getCategoryId = (category) => {
    return category?._id || category?.id || "";
  };

  const getProductCategoryId = (product) => {
    return typeof product?.category_id === "object"
      ? product?.category_id?._id || ""
      : product?.category_id || "";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => getCategoryId(item) === categoryId
    );

    return category?.category_name || "Uncategorized";
  };

  const getCustomerName = (review) => {
    if (typeof review.user_id === "object") {
      return review.user_id?.name || "Unknown Customer";
    }

    return "Unknown Customer";
  };

  const getInitial = (name) => {
    return (name || "U").charAt(0).toUpperCase();
  };

  const renderStars = (rating) => {
    const value = Number(rating) || 0;

    return (
      <span
        className="admin-review-stars"
        aria-label={`${value} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < value ? "filled" : ""}>
            ★
          </span>
        ))}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRatingCounts = (reviewList) => {
    return {
      5: reviewList.filter((review) => Number(review.rating) === 5).length,
      4: reviewList.filter((review) => Number(review.rating) === 4).length,
      3: reviewList.filter((review) => Number(review.rating) === 3).length,
      2: reviewList.filter((review) => Number(review.rating) === 2).length,
      1: reviewList.filter((review) => Number(review.rating) === 1).length,
    };
  };

  const getAverageRating = (reviewList) => {
    if (!reviewList.length) {
      return "0.0";
    }

    const total = reviewList.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return (total / reviewList.length).toFixed(1);
  };

  const overallRatingCounts = useMemo(
    () => getRatingCounts(reviews),
    [reviews]
  );

  const averageRating = useMemo(
    () => getAverageRating(reviews),
    [reviews]
  );

  const categoryStats = useMemo(() => {
    return categories
      .map((category) => {
        const categoryId = getCategoryId(category);

        const categoryReviews = reviews.filter(
          (review) => review.category_id === categoryId
        );

        const categoryProducts = products.filter(
          (product) => getProductCategoryId(product) === categoryId
        );

        return {
          ...category,
          categoryId,
          productCount: categoryProducts.length,
          reviewCount: categoryReviews.length,
          averageRating: getAverageRating(categoryReviews),
        };
      })
      .filter((category) => {
        const query = search.trim().toLowerCase();

        return (
          !query ||
          category.category_name?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }, [categories, products, reviews, search]);

  const selectedCategoryProducts = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return products
      .filter(
        (product) =>
          getProductCategoryId(product) === selectedCategory.categoryId
      )
      .map((product) => {
        const productId = product?._id || product?.id;

        const productReviews = reviews.filter(
          (review) => review.product_id === productId
        );

        return {
          ...product,
          productId,
          reviewCount: productReviews.length,
          averageRating: getAverageRating(productReviews),
        };
      })
      .filter((product) => {
        return !query || product.name?.toLowerCase().includes(query);
      })
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }, [products, reviews, selectedCategory, search]);

  const selectedProductReviews = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    return reviews
      .filter((review) => review.product_id === selectedProduct.productId)
      .filter(() => {
        return true;
      })
      .filter((review) => {
        return (
          ratingFilter === "all" ||
          Number(review.rating) === Number(ratingFilter)
        );
      })
      .filter((review) => {
        const query = search.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          review.review?.toLowerCase().includes(query) ||
          getCustomerName(review).toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      );
  }, [reviews, selectedProduct, ratingFilter, search]);

  const selectedProductRatingCounts = useMemo(() => {
    if (!selectedProduct) {
      return getRatingCounts([]);
    }

    return getRatingCounts(
      reviews.filter(
        (review) => review.product_id === selectedProduct.productId
      )
    );
  }, [reviews, selectedProduct]);

  const openCategory = (category) => {
    setSelectedCategory(category);
    setSelectedProduct(null);
    setSearch("");
    setRatingFilter("all");
    setView("products");
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setSearch("");
    setRatingFilter("all");
    setView("reviews");
  };

  const goToCategories = () => {
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSearch("");
    setRatingFilter("all");
    setView("categories");
  };

  const goToProducts = () => {
    setSelectedProduct(null);
    setSearch("");
    setRatingFilter("all");
    setView("products");
  };

  if (loading) {
    return (
      <div className="admin-reviews-page">
        <div className="admin-reviews-state">
          <div className="admin-reviews-spinner" />
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-reviews-page">
        <div className="admin-reviews-state admin-reviews-error">
          <div className="admin-review-state-icon">!</div>
          <h2>Unable to load reviews</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const selectedProductName =
    selectedProduct?.name || "Product Reviews";

  return (
    <div className="admin-reviews-page">
      <div className="admin-reviews-summary">
        <div className="admin-review-stat">
          <div className="admin-review-stat-icon">★</div>

          <div>
            <span>Total Reviews</span>
            <strong>{reviews.length}</strong>
          </div>
        </div>

        <div className="admin-review-stat">
          <div className="admin-review-stat-icon">☆</div>

          <div>
            <span>Average Rating</span>
            <strong>{averageRating}</strong>
          </div>
        </div>

        <div className="admin-review-stat">
          <div className="admin-review-stat-icon">5★</div>

          <div>
            <span>5 Star Reviews</span>
            <strong>{overallRatingCounts[5]}</strong>
          </div>
        </div>

        <div className="admin-review-stat">
          <div className="admin-review-stat-icon">1★</div>

          <div>
            <span>1 Star Reviews</span>
            <strong>{overallRatingCounts[1]}</strong>
          </div>
        </div>
      </div>

      <div className="admin-reviews-breadcrumb">
        <button
          type="button"
          onClick={goToCategories}
          className={view === "categories" ? "current" : ""}
        >
          Reviews
        </button>

        {selectedCategory && (
          <>
            <span className="admin-reviews-breadcrumb-separator">/</span>

            <button
              type="button"
              onClick={goToProducts}
              className={view === "products" ? "current" : ""}
            >
              {selectedCategory.category_name}
            </button>
          </>
        )}

        {selectedProduct && (
          <>
            <span className="admin-reviews-breadcrumb-separator">/</span>

            <span className="current">{selectedProductName}</span>
          </>
        )}
      </div>

      <section className="admin-reviews-card">
        <div className="admin-reviews-toolbar">
          <div className="admin-reviews-search">
            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                view === "categories"
                  ? "Search category..."
                  : view === "products"
                    ? "Search product..."
                    : "Search reviews..."
              }
            />
          </div>

          {view === "reviews" && (
            <select
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(event.target.value)
              }
              aria-label="Filter reviews by rating"
            >
              <option value="all">All Ratings</option>
              <option value="5">★★★★★ 5 Stars</option>
              <option value="4">★★★★☆ 4 Stars</option>
              <option value="3">★★★☆☆ 3 Stars</option>
              <option value="2">★★☆☆☆ 2 Stars</option>
              <option value="1">★☆☆☆☆ 1 Star</option>
            </select>
          )}
        </div>

        {view === "categories" && (
          <>
            <div className="admin-reviews-results">
              Showing <strong>{categoryStats.length}</strong>{" "}
              categories
            </div>

            {categoryStats.length === 0 ? (
              <div className="admin-reviews-empty">
                <div className="admin-reviews-empty-icon">☆</div>
                <h2>No categories found</h2>
                <p>Try changing your search.</p>
              </div>
            ) : (
              <div className="admin-reviews-list">
                <div className="admin-reviews-list-header admin-reviews-category-header">
                  <span>Category</span>
                  <span>Average Rating</span>
                  <span>Reviews</span>
                  <span>Action</span>
                </div>

                {categoryStats.map((category) => (
                  <div
                    className="admin-reviews-list-row admin-reviews-category-row"
                    key={category.categoryId}
                  >
                    <div className="admin-reviews-category-name">
                      <div className="admin-reviews-category-icon">
                        ◇
                      </div>

                      <div>
                        <strong>
                          {category.category_name || "Uncategorized"}
                        </strong>

                        <span>
                          {category.productCount}{" "}
                          {category.productCount === 1
                            ? "product"
                            : "products"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-review-rating">
                      {renderStars(category.averageRating)}

                      <span className="admin-review-rating-value">
                        {category.averageRating}
                      </span>
                    </div>

                    <span className="admin-review-count">
                      {category.reviewCount}
                    </span>

                    <button
                      type="button"
                      className="admin-review-view-button"
                      onClick={() => openCategory(category)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "products" && selectedCategory && (
          <>
            <div className="admin-reviews-results">
              <strong>{selectedCategory.category_name}</strong>{" "}
              · Showing{" "}
              <strong>{selectedCategoryProducts.length}</strong>{" "}
              products
            </div>

            {selectedCategoryProducts.length === 0 ? (
              <div className="admin-reviews-empty">
                <div className="admin-reviews-empty-icon">◇</div>
                <h2>No products found</h2>
                <p>
                  There are no products matching your search in
                  this category.
                </p>
              </div>
            ) : (
              <div className="admin-reviews-list">
                <div className="admin-reviews-list-header admin-reviews-product-header">
                  <span>Product</span>
                  <span>Average Rating</span>
                  <span>Reviews</span>
                  <span>Action</span>
                </div>

                {selectedCategoryProducts.map((product) => (
                  <div
                    className="admin-reviews-list-row admin-reviews-product-row"
                    key={product.productId}
                  >
                    <div className="admin-reviews-product">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <div className="admin-review-product-placeholder">
                          ◇
                        </div>
                      )}

                      <div>
                        <strong>{product.name}</strong>

                        <span>
                          {product.reviewCount}{" "}
                          {product.reviewCount === 1
                            ? "review"
                            : "reviews"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-review-rating">
                      {renderStars(product.averageRating)}

                      <span className="admin-review-rating-value">
                        {product.averageRating}
                      </span>
                    </div>

                    <span className="admin-review-count">
                      {product.reviewCount}
                    </span>

                    <button
                      type="button"
                      className="admin-review-view-button"
                      onClick={() => openProduct(product)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "reviews" && selectedProduct && (
          <div className="admin-review-detail">
            <div className="admin-review-detail-header">
              <div className="admin-review-detail-product">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                ) : (
                  <div className="admin-review-detail-product-placeholder">
                    ◇
                  </div>
                )}

                <div>
                  <h2>{selectedProduct.name}</h2>

                  <p>
                    {getCategoryName(
                      getProductCategoryId(selectedProduct)
                    )}
                  </p>
                </div>
              </div>

              <div className="admin-review-detail-rating">
                <strong>
                  {getAverageRating(
                    reviews.filter(
                      (review) =>
                        review.product_id ===
                        selectedProduct.productId
                    )
                  )}
                </strong>

                <div>
                  {renderStars(
                    getAverageRating(
                      reviews.filter(
                        (review) =>
                          review.product_id ===
                          selectedProduct.productId
                      )
                    )
                  )}
                </div>

                <span>
                  {
                    reviews.filter(
                      (review) =>
                        review.product_id ===
                        selectedProduct.productId
                    ).length
                  }{" "}
                  total reviews
                </span>
              </div>
            </div>

            <div className="admin-review-distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const totalProductReviews = Object.values(
                  selectedProductRatingCounts
                ).reduce((sum, count) => sum + count, 0);

                const count =
                  selectedProductRatingCounts[rating] || 0;

                const percentage = totalProductReviews
                  ? (count / totalProductReviews) * 100
                  : 0;

                return (
                  <div
                    className="admin-review-distribution-row"
                    key={rating}
                  >
                    <span className="admin-review-distribution-label">
                      {rating} ★
                    </span>

                    <div className="admin-review-distribution-bar">
                      <div
                        className="admin-review-distribution-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="admin-review-distribution-count">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="admin-review-detail-toolbar">
              <div>
                <h3>Customer Reviews</h3>

                <span>
                  Showing {selectedProductReviews.length} of{" "}
                  {
                    reviews.filter(
                      (review) =>
                        review.product_id ===
                        selectedProduct.productId
                    ).length
                  }{" "}
                  reviews
                </span>
              </div>
            </div>

            {selectedProductReviews.length === 0 ? (
              <div className="admin-reviews-empty">
                <div className="admin-reviews-empty-icon">☆</div>

                <h2>No reviews found</h2>

                <p>Try changing the rating filter.</p>
              </div>
            ) : (
              <div className="admin-review-items">
                {selectedProductReviews.map((review, index) => {
                  const customerName = getCustomerName(review);

                  return (
                    <article
                      className="admin-review-item"
                      key={
                        review._id ||
                        `${review.product_id}-${review.created_at}-${index}`
                      }
                    >
                      <div className="admin-review-item-header">
                        <div className="admin-review-customer">
                          <div className="admin-review-avatar">
                            {getInitial(customerName)}
                          </div>

                          <div>
                            <strong>{customerName}</strong>

                            <small>
                              {formatDate(review.created_at)}
                            </small>
                          </div>
                        </div>

                        {renderStars(review.rating)}
                      </div>

                      <p className="admin-review-item-text">
                        {review.review || "No review text"}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReviews;