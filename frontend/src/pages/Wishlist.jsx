import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import "./Wishlist.css";

function Wishlist() {
  const {
    wishlistItems,
    toggleWishlist,
    clearWishlist,
  } = useWishlist();

  return (
    <main className="wishlist-page">

      {/* WISHLIST HERO */}

      <section className="wishlist-hero">
        <div className="container">

          <span className="wishlist-label">
            SAVED FOR LATER
          </span>

          <h1>My Wishlist</h1>

          <p>
            Keep track of the products you love and
            come back to them whenever you're ready.
          </p>

        </div>
      </section>


      {/* ================================
          WISHLIST CONTENT
      ================================= */}

      <section className="container wishlist-content">

        {wishlistItems.length === 0 ? (

          /* ================================
             EMPTY WISHLIST
          ================================= */

          <div className="wishlist-empty">

            <div className="empty-icon">
              ♡
            </div>

            <h2>
              Your wishlist is empty
            </h2>

            <p>
              Save products you love by clicking the
              heart icon on any product.
            </p>

            <Link
              to="/shop"
              className="wishlist-shop-button"
            >
              Explore Products →
            </Link>

          </div>

        ) : (

          /* ================================
             WISHLIST WITH PRODUCTS
          ================================= */

          <>

            {/* Wishlist Top Bar */}

            <div className="wishlist-top">

              <strong>
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1
                  ? "Product"
                  : "Products"}
              </strong>

              <button
                type="button"
                className="clear-wishlist"
                onClick={clearWishlist}
              >
                Clear Wishlist
              </button>

            </div>


            {/* Product Grid */}

            <div className="wishlist-grid">

              {wishlistItems.map((product) => (

                <article
                  className="wishlist-card"
                  key={product.id}
                >

                  {/* ================================
                      PRODUCT IMAGE
                  ================================= */}

                  <div className="wishlist-image">

                    <Link
                      to={`/product/${product.id}`}
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          product.image
                        }
                        alt={product.name}
                      />
                    </Link>


                    {/* Remove From Wishlist */}

                    <button
                      type="button"
                      className="wishlist-remove"
                      onClick={() =>
                        toggleWishlist(product)
                      }
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      ♥
                    </button>


                    {/* Sale Badge */}

                    {product.oldPrice &&
                      Number(product.oldPrice) >
                        Number(product.price) && (
                        <span className="wishlist-sale">
                          SALE
                        </span>
                    )}

                  </div>


                  {/* ================================
                      PRODUCT INFORMATION
                  ================================= */}

                  <div className="wishlist-info">

                    {/* Category */}

                    {product.category && (
                      <span className="wishlist-category">
                        {product.category}
                      </span>
                    )}


                    {/* Product Name */}

                    <Link
                      to={`/product/${product.id}`}
                      className="wishlist-product-name"
                    >
                      {product.name}
                    </Link>


                    {/* Rating */}

                    <div className="wishlist-rating">

                      <span>
                        ★★★★★
                      </span>

                      {product.rating !== undefined &&
                        product.rating !== null && (
                          <small>
                            {product.rating}
                          </small>
                      )}

                    </div>


                    {/* Price */}

                    <div className="wishlist-price">

                      <strong>
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                      {product.oldPrice && (
                        <del>
                          ₹
                          {Number(
                            product.oldPrice
                          ).toLocaleString("en-IN")}
                        </del>
                      )}

                    </div>


                    {/* View Product */}

                    <Link
                      to={`/product/${product.id}`}
                      className="wishlist-view-button"
                    >
                      View Product →
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          </>

        )}

      </section>

    </main>
  );
}

export default Wishlist;