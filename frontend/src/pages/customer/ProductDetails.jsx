import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  addProductReview,
  getCategories,
  getProductById,
  getProductReviews,
  getProducts,
} from "../../services/api";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

import "./ProductDetails.css";

const getEntityId = (entity) => {
  if (!entity) return "";

  if (typeof entity === "object") {
    return entity._id || entity.id || "";
  }

  return entity;
};

const getCategoryName = (categoryId, categories) => {
  if (!categoryId) {
    return "Product";
  }

  const normalizedCategoryId = getEntityId(categoryId);

  const category = categories.find(
    (item) =>
      String(item._id || item.id) ===
      String(normalizedCategoryId)
  );

  if (category) {
    return category.category_name || category.name || "Product";
  }

  if (typeof categoryId === "object") {
    return (
      categoryId.category_name ||
      categoryId.name ||
      "Product"
    );
  }

  return "Product";
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setSelectedImage(0);
      setQuantity(1);
      setImageError(false);
      setActiveTab("description");
      setCartError("");
      setAddedToCart(false);

      try {
        const [
          productResponse,
          categoriesResponse,
          productsResponse,
        ] = await Promise.all([
          getProductById(id),
          getCategories(),
          getProducts(),
        ]);

        if (cancelled) {
          return;
        }

        const productData =
          productResponse?.data || productResponse || null;

        if (!productData) {
          setProduct(null);
          setCategories([]);
          setRelatedProducts([]);
          return;
        }

        setProduct(productData);

        const categoryData = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse?.data || [];

        setCategories(categoryData);

        const allProducts = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse?.data || [];

        const currentProductId = getEntityId(productData);

        const currentCategoryId = getEntityId(
          productData.category_id
        );

        const related = allProducts
          .filter((item) => {
            const itemId = getEntityId(item);
            const itemCategoryId = getEntityId(
              item.category_id
            );

            return (
              String(itemId) !== String(currentProductId) &&
              currentCategoryId &&
              itemCategoryId &&
              String(itemCategoryId) ===
                String(currentCategoryId) &&
              item.status === "Active"
            );
          })
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load this product."
          );

          setProduct(null);
          setRelatedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviews([]);
      setReviewError("");
      setReviewSuccess("");

      try {
        const response = await getProductReviews(id);

        if (cancelled) {
          return;
        }

        setReviews(
          Array.isArray(response)
            ? response
            : response?.data || []
        );
      } catch {
        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const categoryName = useMemo(() => {
    return getCategoryName(
      product?.category_id,
      categories
    );
  }, [product?.category_id, categories]);

  const productImages = useMemo(() => {
    if (!product?.image) {
      return [];
    }

    return [product.image];
  }, [product?.image]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return Number(
      (totalRating / reviews.length).toFixed(1)
    );
  }, [reviews]);

  const discountPercentage = useMemo(() => {
    return Math.max(
      0,
      Math.min(
        100,
        Math.round(Number(product?.discount || 0))
      )
    );
  }, [product?.discount]);

  const originalPrice = useMemo(() => {
    const price = Number(product?.price || 0);

    if (
      !price ||
      discountPercentage <= 0 ||
      discountPercentage >= 100
    ) {
      return 0;
    }

    return Math.round(
      price / (1 - discountPercentage / 100)
    );
  }, [product?.price, discountPercentage]);

  const increaseQuantity = () => {
    setQuantity((current) => {
      const stock = Number(product?.stock || 0);

      if (stock > 0 && current >= stock) {
        return current;
      }

      return current + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  const getCartProduct = () => ({
    id: product._id || product.id,
    name: product.name,
    description: product.description,
    categoryId: getEntityId(product.category_id),
    category: categoryName,
    price: product.price,
    discount: product.discount || 0,
    stock: product.stock,
    image: product.image,
    status: product.status,
  });

  const handleAddToCart = async () => {
    setCartError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!product) {
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      setCartError(
        "This product is currently out of stock."
      );
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(
        getCartProduct(),
        quantity
      );

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (err) {
      setCartError(
        err?.response?.data?.message ||
          "Unable to add this product to your cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setCartError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!product) {
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      setCartError(
        "This product is currently out of stock."
      );
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(
        getCartProduct(),
        quantity
      );

      navigate("/cart");
    } catch (err) {
      setCartError(
        err?.response?.data?.message ||
          "Unable to continue with this purchase."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!product) {
      return;
    }

    setWishlistLoading(true);

    try {
      await toggleWishlist({
        id: product._id || product.id,
        name: product.name,
        description: product.description,
        categoryId: getEntityId(product.category_id),
        category: categoryName,
        price: product.price,
        discount: product.discount || 0,
        stock: product.stock,
        image: product.image,
        status: product.status,
      });
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      setReviewError(
        "Please select a rating from 1 to 5."
      );
      return;
    }

    const trimmedReview = reviewText.trim();

    if (!trimmedReview) {
      setReviewError("Please write a review.");
      return;
    }

    if (trimmedReview.length < 5) {
      setReviewError(
        "Your review should contain at least 5 characters."
      );
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      await addProductReview({
        product_id: product._id || product.id,
        rating: reviewRating,
        review: trimmedReview,
      });

      const response = await getProductReviews(id);

      const updatedReviews = Array.isArray(response)
        ? response
        : response?.data || [];

      setReviews(updatedReviews);

      setReviewRating(0);
      setReviewText("");

      setReviewSuccess(
        "Your review has been submitted successfully."
      );

      setTimeout(() => {
        setReviewSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Review submission failed:",
        err
      );

      setReviewError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to submit your review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="product-details-page">
        <section className="container product-not-found">
          <span className="section-label">
            SHOPVERSE
          </span>

          <h1>Loading Product...</h1>

          <p>
            Please wait while we load the
            latest product information.
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="product-details-page">
        <section className="container product-not-found">
          <span className="section-label">
            SHOPVERSE
          </span>

          <h1>Unable to Load Product</h1>

          <p>{error}</p>

          <Link
            to="/shop"
            className="buy-now-button"
          >
            Back to Shop
          </Link>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-page">
        <section className="container product-not-found">
          <span className="section-label">
            SHOPVERSE
          </span>

          <h1>Product Not Found</h1>

          <p>
            Sorry, we couldn't find the
            product you're looking for.
          </p>

          <Link
            to="/shop"
            className="buy-now-button"
          >
            Back to Shop
          </Link>
        </section>
      </main>
    );
  }

  const productId =
    product._id || product.id;

  const inWishlist =
    isInWishlist(productId);

  const stock = Number(
    product.stock || 0
  );

  const isOutOfStock = stock <= 0;

  const isLowStock =
    stock > 0 && stock <= 5;

  return (
    <main className="product-details-page">
      <div className="container product-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="container product-main">
        <div className="product-gallery">
          {productImages.length > 0 && (
            <div className="product-thumbnails">
              {productImages.map(
                (image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={`product-thumbnail ${
                      selectedImage === index
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    aria-label={`View ${product.name} image ${
                      index + 1
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${
                        index + 1
                      }`}
                    />
                  </button>
                )
              )}
            </div>
          )}

          <div className="product-main-image">
            {discountPercentage > 0 && (
              <span className="details-sale-badge">
                -{discountPercentage}%
              </span>
            )}

            {isOutOfStock && (
              <span className="details-stock-badge">
                Out of Stock
              </span>
            )}

            <button
              type="button"
              className={`details-wishlist ${
                inWishlist ? "selected" : ""
              }`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
              aria-label={
                inWishlist
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              {inWishlist ? "♥" : "♡"}
            </button>

            {productImages.length > 0 &&
            !imageError ? (
              <img
                src={
                  productImages[selectedImage]
                }
                alt={product.name}
                onError={() =>
                  setImageError(true)
                }
              />
            ) : (
              <div className="product-image-placeholder">
                <span>Image unavailable</span>
              </div>
            )}
          </div>
        </div>

        <div className="product-details-info">
          <span className="details-category">
            {categoryName}
          </span>

          <h1>{product.name}</h1>

          <div className="details-rating">
            <span
              aria-label={`Rated ${averageRating} out of 5`}
            >
              {averageRating > 0
                ? Array.from(
                    { length: 5 },
                    (_, index) =>
                      index <
                      Math.round(
                        averageRating
                      )
                        ? "★"
                        : "☆"
                  ).join("")
                : "☆☆☆☆☆"}
            </span>

            <strong>
              {averageRating > 0
                ? averageRating.toFixed(1)
                : "No rating"}
            </strong>

            <a href="#reviews">
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </a>
          </div>

          <div className="details-price">
            <strong>
              ₹
              {Number(
                product.price || 0
              ).toLocaleString("en-IN")}
            </strong>

            {discountPercentage > 0 &&
              originalPrice >
                Number(product.price || 0) && (
                <del>
                  ₹
                  {originalPrice.toLocaleString(
                    "en-IN"
                  )}
                </del>
              )}

            {discountPercentage > 0 && (
              <span>
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          <div className="details-divider" />

          <p className="details-description">
            {product.description}
          </p>

          <div
            className={`stock-status ${
              isOutOfStock
                ? "out-of-stock"
                : isLowStock
                  ? "low-stock"
                  : ""
            }`}
          >
            <span className="stock-dot" />

            {isOutOfStock
              ? "Out of stock"
              : isLowStock
                ? `Only ${stock} left in stock`
                : `${stock} items available`}
          </div>

          {cartError && (
            <div
              className="product-action-error"
              role="alert"
            >
              {cartError}
            </div>
          )}

          <div className="purchase-row">
            <div className="quantity-control">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={
                  quantity <= 1 ||
                  isOutOfStock
                }
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  isOutOfStock ||
                  quantity >= stock
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="details-cart-button"
              onClick={handleAddToCart}
              disabled={
                isOutOfStock ||
                addingToCart
              }
            >
              {addingToCart
                ? "Adding..."
                : addedToCart
                  ? "✓ Added to Cart"
                  : "Add to Cart"}
            </button>
          </div>

          <button
            type="button"
            className="buy-now-button"
            onClick={handleBuyNow}
            disabled={
              isOutOfStock ||
              addingToCart
            }
          >
            Buy Now
          </button>

          <div className="product-benefits">
            <div>
              <span>◇</span>

              <div>
                <strong>
                  Free Delivery
                </strong>

                <small>
                  On orders over ₹999
                </small>
              </div>
            </div>

            <div>
              <span>↻</span>

              <div>
                <strong>
                  Easy Returns
                </strong>

                <small>
                  7-day return policy
                </small>
              </div>
            </div>

            <div>
              <span>✓</span>

              <div>
                <strong>
                  Secure Payment
                </strong>

                <small>
                  100% secure checkout
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container product-information">
        <div className="information-tabs">
          <button
            type="button"
            className={
              activeTab === "description"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("description")
            }
          >
            Description
          </button>

          <button
            type="button"
            className={
              activeTab === "specifications"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "specifications"
              )
            }
          >
            Specifications
          </button>

          <button
            type="button"
            className={
              activeTab === "shipping"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("shipping")
            }
          >
            Shipping & Returns
          </button>
        </div>

        <div className="information-content">
          {activeTab === "description" && (
            <div>
              <h2>Product Details</h2>

              <p>
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              <h2>Specifications</h2>

              <div className="specifications">
                <div>
                  <span>Category</span>

                  <strong>
                    {categoryName}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {product.status}
                  </strong>
                </div>

                <div>
                  <span>Stock</span>

                  <strong>
                    {stock} units
                  </strong>
                </div>

                <div>
                  <span>Rating</span>

                  <strong>
                    {averageRating > 0
                      ? `${averageRating} / 5`
                      : "No reviews yet"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div>
              <h2>
                Shipping & Returns
              </h2>

              <p>
                We aim to deliver your
                order within 2–5 business
                days.
              </p>

              <p>
                If you're not completely
                satisfied, you can request
                a return within 7 days,
                subject to our return
                policy.
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        id="reviews"
        className="reviews-section"
      >
        <div className="container">
          <div className="reviews-heading">
            <div>
              <span className="section-label">
                CUSTOMER FEEDBACK
              </span>

              <h2>
                Customer Reviews
              </h2>
            </div>

            <div className="overall-rating">
              <strong>
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "—"}
              </strong>

              <span>
                {averageRating > 0
                  ? Array.from(
                      { length: 5 },
                      (_, index) =>
                        index <
                        Math.round(
                          averageRating
                        )
                          ? "★"
                          : "☆"
                    ).join("")
                  : "☆☆☆☆☆"}
              </span>

              <small>
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
              </small>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="review-form-card">
              <div className="review-form-heading">
                <span className="section-label">
                  SHARE YOUR EXPERIENCE
                </span>

                <h3>
                  Write a Review
                </h3>

                <p>
                  Hi{" "}
                  {user?.name ||
                    "Customer"}
                  , tell us what you
                  think about this
                  product.
                </p>
              </div>

              <form
                onSubmit={
                  handleSubmitReview
                }
              >
                <div className="review-rating-input">
                  <label>
                    Your Rating
                  </label>

                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          className={
                            star <=
                            reviewRating
                              ? "selected"
                              : ""
                          }
                          onClick={() => {
                            setReviewRating(
                              star
                            );
                            setReviewError(
                              ""
                            );
                          }}
                          aria-label={`Rate ${star} out of 5`}
                        >
                          ★
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="review-text-input">
                  <label htmlFor="review">
                    Your Review
                  </label>

                  <textarea
                    id="review"
                    value={reviewText}
                    onChange={(event) => {
                      setReviewText(
                        event.target.value
                      );
                      setReviewError("");
                    }}
                    placeholder="Share your thoughts about this product..."
                    rows="5"
                    maxLength="1000"
                  />

                  <small>
                    {reviewText.length}
                    /1000
                  </small>
                </div>

                {reviewError && (
                  <div
                    className="review-message error"
                    role="alert"
                  >
                    {reviewError}
                  </div>
                )}

                {reviewSuccess && (
                  <div
                    className="review-message success"
                    role="status"
                  >
                    {reviewSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-review-button"
                  disabled={
                    reviewSubmitting
                  }
                >
                  {reviewSubmitting
                    ? "Submitting..."
                    : "Submit Review →"}
                </button>
              </form>
            </div>
          ) : (
            <div className="review-login-message">
              <p>
                Sign in to share your
                experience with this
                product.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="submit-review-button"
              >
                Sign In to Review →
              </button>
            </div>
          )}

          <div className="reviews-list">
            {reviewsLoading ? (
              <article className="review-card">
                <p>
                  Loading reviews...
                </p>
              </article>
            ) : reviews.length === 0 ? (
              <article className="review-card">
                <p>
                  No reviews yet. Be
                  the first to review
                  this product.
                </p>
              </article>
            ) : (
              reviews.map((review) => {
                const rating = Math.min(
                  5,
                  Math.max(
                    0,
                    Number(
                      review.rating || 0
                    )
                  )
                );

                return (
                  <article
                    className="review-card"
                    key={review._id}
                  >
                    <div className="review-stars">
                      {Array.from(
                        { length: 5 },
                        (_, index) =>
                          index < rating
                            ? "★"
                            : "☆"
                      ).join("")}
                    </div>

                    <p>
                      "{review.review}"
                    </p>

                    <strong>
                      {review.user_id?.name ||
                        "Customer"}
                    </strong>

                    <small>
                      Customer Review
                    </small>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="container related-products">
          <div className="section-heading">
            <div>
              <span className="section-label">
                YOU MAY ALSO LIKE
              </span>

              <h2>
                Related Products
              </h2>
            </div>

            <Link
              to="/shop"
              className="view-all"
            >
              View all →
            </Link>
          </div>

          <div className="related-grid">
            {relatedProducts.map((item) => {
              const itemId =
                item._id || item.id;

              const itemCategory =
                getCategoryName(
                  item.category_id,
                  categories
                );

              const itemDiscount =
                Number(
                  item.discount || 0
                );

              return (
                <Link
                  to={`/product/${itemId}`}
                  className="related-card"
                  key={itemId}
                >
                  <div className="related-card-image">
                    {itemDiscount > 0 && (
                      <span>
                        -{Math.round(
                          itemDiscount
                        )}%
                      </span>
                    )}

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>
                          Image unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="related-card-category">
                    {itemCategory}
                  </span>

                  <h3>{item.name}</h3>

                  <div className="related-card-price">
                    <strong>
                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    {itemDiscount > 0 && (
                      <small>
                        {Math.round(
                          itemDiscount
                        )}% OFF
                      </small>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetails;