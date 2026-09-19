import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ProductCard.css";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { toggleWishlist, isInWishlist } = useWishlist();

  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const productId = product.id || product._id;

  const inWishlist = isInWishlist(productId);

  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  const stock = Number(product.stock || 0);

  const hasDiscount = discount > 0;

  const oldPrice = hasDiscount
    ? price / (1 - discount / 100)
    : Number(product.oldPrice || 0);

  const rating = Math.min(
    5,
    Math.max(0, Number(product.rating || 0))
  );

  const reviewCount = Number(product.reviews || 0);

  const isOutOfStock = stock <= 0;

  const displayCategory =
    product.category ||
    product.category_name ||
    "Collection";

  const showImage =
    product.image && !imageError;

  const handleAddToCart = async () => {
    setMessage("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!productId) {
      setMessage("Unable to add this product.");
      return;
    }

    if (isOutOfStock) {
      setMessage("This product is currently out of stock.");
      return;
    }

    setAdding(true);

    try {
      await addToCart(product, 1);

      setMessage("Added to cart ✓");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          "Unable to add this product."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!productId) return;

    setWishlistLoading(true);

    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;

      return (
        <span
          key={starNumber}
          className={
            starNumber <= Math.round(rating)
              ? "star filled"
              : "star"
          }
          aria-hidden="true"
        >
          ★
        </span>
      );
    });
  };

  return (
    <article className="product-card">
      {/* Product image area */}
      <div className="product-card-image">
        {hasDiscount && (
          <span className="product-sale-badge">
            -{discount}%
          </span>
        )}

        {isOutOfStock && (
          <span className="product-stock-badge">
            Out of Stock
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={`product-wishlist ${
            inWishlist ? "active" : ""
          }`}
          aria-label={
            inWishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={handleWishlist}
          disabled={wishlistLoading}
        >
          {inWishlist ? "♥" : "♡"}
        </button>

        {/* Product Image */}
        <Link
          to={`/product/${productId}`}
          className="product-image-link"
          aria-label={`View ${product.name}`}
        >
          {showImage ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="product-image-placeholder"
              aria-label="Product image unavailable"
            >
              <span>Image unavailable</span>
            </div>
          )}
        </Link>

        {/* Add to Cart */}
        <button
          type="button"
          className={`product-add-button ${
            isOutOfStock ? "disabled" : ""
          }`}
          onClick={handleAddToCart}
          disabled={adding || isOutOfStock}
        >
          {isOutOfStock
            ? "Out of Stock"
            : adding
              ? "Adding..."
              : "Add to Cart"}
        </button>

        {message && (
          <span
            className="product-cart-message"
            role="status"
          >
            {message}
          </span>
        )}
      </div>

      {/* Product information */}
      <div className="product-card-content">
        <span className="product-card-category">
          {displayCategory}
        </span>

        <Link to={`/product/${productId}`}>
          <h3>{product.name}</h3>
        </Link>

        {/* Rating */}
        <div
          className="product-rating"
          aria-label={`Rated ${rating} out of 5`}
        >
          <span className="product-stars">
            {renderStars()}
          </span>

          <small>
            {rating > 0
              ? `${rating.toFixed(1)}${
                  reviewCount > 0
                    ? ` (${reviewCount})`
                    : ""
                }`
              : "No reviews"}
          </small>
        </div>

        {/* Price */}
        <div className="product-price">
          <strong>
            ₹{price.toLocaleString("en-IN")}
          </strong>

          {hasDiscount && oldPrice > price && (
            <del>
              ₹{Math.round(oldPrice).toLocaleString("en-IN")}
            </del>
          )}
        </div>

        {/* Stock hint */}
        {!isOutOfStock && stock <= 5 && (
          <span className="product-low-stock">
            Only {stock} left
          </span>
        )}
      </div>
    </article>
  );
}

export default ProductCard;