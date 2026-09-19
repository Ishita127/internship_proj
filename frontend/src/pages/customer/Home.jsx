import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import {
  getCategories,
  getProductReviews,
  getProducts,
} from "../../services/api";
import heroImage from "../../assets/hero-products.png";
import "./Home.css";

/* Promotion Images */

const promotionImages = {
  fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85",
  technology:
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1400&q=85",
};

const fallbackProductImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=85";

const testimonials = [
  {
    name: "Priya Sharma",
    text: "Amazing quality and super fast delivery. The whole shopping experience felt premium.",
  },
  {
    name: "Rahul Mehta",
    text: "Great products and even better customer service. Will definitely shop again!",
  },
  {
    name: "Sneha Kapoor",
    text: "Loved the packaging and product quality. A truly smooth shopping experience.",
  },
];

/* Helpers */

function getId(item) {
  return item?._id || item?.id || "";
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function getCategoryName(product, categories) {
  if (product?.category_id?.category_name) {
    return product.category_id.category_name;
  }

  if (product?.category?.category_name) {
    return product.category.category_name;
  }

  if (typeof product?.category === "string") {
    return product.category;
  }

  const categoryId =
    typeof product?.category_id === "string"
      ? product.category_id
      : product?.category_id?._id;

  const matchedCategory = categories.find(
    (category) => getId(category) === categoryId
  );

  return matchedCategory?.category_name || "Uncategorized";
}

function normalizeProduct(product, categories, reviews = []) {
  const id = getId(product);

  const ratingValues = reviews
    .map((review) => Number(review?.rating))
    .filter(
      (rating) =>
        Number.isFinite(rating) && rating >= 1 && rating <= 5
    );

  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce((sum, rating) => sum + rating, 0) /
        ratingValues.length
      : 0;

  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);

  return {
    ...product,
    id,
    name: product?.name || "Untitled Product",
    description: product?.description || "",
    category: getCategoryName(product, categories),
    price,
    stock: Number(product?.stock || 0),
    image: product?.image || fallbackProductImage,
    discount,
    sale: discount > 0,
    rating: averageRating ? averageRating.toFixed(1) : "0.0",
    reviews: ratingValues.length,
    oldPrice: null,
  };
}

/* Home */

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const loadHomeData = async () => {
    setLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      const productList = extractList(productsResponse);
      const categoryList = extractList(categoriesResponse);

      setCategories(categoryList);

      const activeProducts = productList.filter(
        (product) =>
          product?.status === undefined || product?.status === "Active"
      );

      const reviewResults = await Promise.allSettled(
        activeProducts.map((product) => {
          const productId = getId(product);

          return productId
            ? getProductReviews(productId)
            : Promise.resolve({ data: [] });
        })
      );

      const productsWithReviews = activeProducts.map((product, index) => {
        const result = reviewResults[index];

        const reviews =
          result?.status === "fulfilled"
            ? extractList(result.value)
            : [];

        return normalizeProduct(product, categoryList, reviews);
      });

      setProducts(productsWithReviews);
    } catch (err) {
      console.error("Home data loading error:", err);

      setProducts([]);
      setCategories([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load the store right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const trendingProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          Number(b.reviews || 0) - Number(a.reviews || 0) ||
          Number(b.rating || 0) - Number(a.rating || 0)
      )
      .slice(0, 4);
  }, [products]);

  const categoryList = useMemo(() => categories, [categories]);

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  return (
    <main className="home">
      {/* Announcement */}

      <div className="announcement">
        <div className="announcement-track">
          <span>Free shipping on orders over ₹999</span>
          <span className="announcement-dot">•</span>
          <span>Easy returns</span>
          <span className="announcement-dot">•</span>
          <span>Secure payments</span>
        </div>
      </div>

      {/* Hero */}

      <section className="hero">
        <div className="hero-content container">
          <div className="hero-text">
            <span className="eyebrow">NEW SEASON</span>

            <h1>
              Elevate
              <br />
              Your Everyday
            </h1>

            <p>
              Discover premium products for modern living. Fashion,
              technology, home essentials and more — all in one place.
            </p>

            <div className="hero-buttons">
              <Link to="/shop" className="primary-button">
                Shop Now <span aria-hidden="true">→</span>
              </Link>

              <Link to="/categories" className="secondary-button">
                Explore Categories
              </Link>
            </div>

            <div className="hero-trust">
              <span>
                <b aria-hidden="true">✓</b> Trusted products
              </span>

              <span>
                <b aria-hidden="true">✓</b> Fast delivery
              </span>

              <span className="desktop-trust">
                <b aria-hidden="true">✓</b> Secure checkout
              </span>
            </div>
          </div>

          <div className="hero-image">
            <img
              src={heroImage}
              alt="Featured ShopVerse collection"
            />

            <div className="hero-floating-card">
              <span>Trending now</span>
              <strong>Discover something new</strong>
              <Link to="/shop">Explore →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}

      <section className="categories-section container">
        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Shop by Category</h2>
            <p>Find what fits your lifestyle.</p>
          </div>

          <Link to="/categories" className="view-all">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="home-loading">
            <div className="loading-spinner" />
            <p>Loading categories...</p>
          </div>
        ) : categoryList.length > 0 ? (
          <div className="categories-grid">
            {categoryList.map((category) => {
              const categoryId = getId(category);
              const categoryName =
                category?.category_name || "Category";

              /* Use the image provided by the admin */
              const categoryImage =
                category?.image ||
                category?.image_url ||
                category?.category_image ||
                fallbackProductImage;

              return (
                <Link
                  to={`/shop?category=${encodeURIComponent(
                    categoryName
                  )}`}
                  className="category-card"
                  key={categoryId || categoryName}
                >
                  <div className="category-image">
                    <img
                      src={categoryImage}
                      alt={categoryName}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src =
                          fallbackProductImage;
                      }}
                    />

                    <span
                      className="category-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>

                  <div className="category-info">
                    <h3>{categoryName}</h3>
                    <span>Explore</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="home-empty">
            <p>No categories available right now.</p>
          </div>
        )}
      </section>

      {/* Trending Products */}

      <section className="products-section container">
        <div className="section-heading">
          <div>
            <span className="section-label">MOST LOVED</span>
            <h2>Trending Products</h2>
            <p>
              Popular picks our customers are loving right now.
            </p>
          </div>

          <Link to="/shop" className="view-all">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="home-loading">
            <div className="loading-spinner" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="home-error">
            <div className="state-icon" aria-hidden="true">
              !
            </div>

            <p>{error}</p>

            <button
              type="button"
              className="home-retry-button"
              onClick={loadHomeData}
            >
              Try Again
            </button>
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="products-grid">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="home-empty">
            <p>No products are available right now.</p>

            <Link to="/shop" className="primary-button">
              Explore Shop →
            </Link>
          </div>
        )}
      </section>

      {/* Promotions */}

      <section className="promotions container">
        <div className="promotion promotion-fashion">
          <div className="promotion-content">
            <span>LIMITED OFFER</span>
            <h2>Up to 50% Off</h2>
            <p>
              Discover our premium fashion collection.
            </p>

            <Link
              to="/shop?category=Fashion"
              className="promotion-button"
            >
              Shop Fashion →
            </Link>
          </div>
        </div>

        <div className="promotion promotion-tech">
          <div className="promotion-content">
            <span>SMARTER LIVING</span>
            <h2>Latest Gadgets</h2>
            <p>
              Technology designed for your everyday.
            </p>

            <Link
              to="/shop?category=Electronics"
              className="promotion-button light"
            >
              Shop Electronics →
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}

      <section className="benefits-section">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">OUR PROMISE</span>
            <h2>Why Shop With Us</h2>
            <p>
              Everything you need for a smoother shopping experience.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon" aria-hidden="true">
                ✦
              </div>
              <h3>Quality First</h3>
              <p>
                Carefully selected products made for everyday life.
              </p>
            </div>

            <div className="benefit">
              <div className="benefit-icon" aria-hidden="true">
                ⌁
              </div>
              <h3>Fast Delivery</h3>
              <p>
                Reliable delivery with updates at every step.
              </p>
            </div>

            <div className="benefit">
              <div className="benefit-icon" aria-hidden="true">
                ↻
              </div>
              <h3>Easy Returns</h3>
              <p>
                Simple returns designed to make shopping stress-free.
              </p>
            </div>

            <div className="benefit">
              <div className="benefit-icon" aria-hidden="true">
                ◇
              </div>
              <h3>Secure Payments</h3>
              <p>
                Your payment information is handled securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}

      <section className="testimonials container">
        <div className="section-heading">
          <div>
            <span className="section-label">CUSTOMER LOVE</span>
            <h2>What Our Customers Say</h2>
            <p>
              Real experiences from the ShopVerse community.
            </p>
          </div>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article
              className="testimonial"
              key={testimonial.name}
            >
              <div
                className="testimonial-stars"
                aria-label="5 out of 5 stars"
              >
                ★★★★★
              </div>

              <p>"{testimonial.text}"</p>

              <div className="testimonial-user">
                <div className="avatar" aria-hidden="true">
                  {testimonial.name.charAt(0)}
                </div>

                <div>
                  <strong>{testimonial.name}</strong>
                  <span>Verified customer</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section className="cta-section container">
        <div className="cta">
          <span>YOUR NEXT FAVORITE FIND</span>

          <h2>
            Better products.
            <br />
            Better everyday.
          </h2>

          <p>
            Explore our collection and discover something you'll love.
          </p>

          <Link to="/shop" className="primary-button">
            Start Shopping →
          </Link>
        </div>
      </section>

      {/* Footer */}

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              SHOP<span>VERSE</span>
            </Link>

            <p>
              Your one-stop shop for products that make everyday
              life better.
            </p>

            <div className="socials">
              <a href="#" aria-label="Instagram">
                ◎
              </a>
              <a href="#" aria-label="Facebook">
                f
              </a>
              <a href="#" aria-label="YouTube">
                ▶
              </a>
              <a href="#" aria-label="X">
                𝕏
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Shop</h3>
            <Link to="/shop">All Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/shop">New Arrivals</Link>
            <Link to="/shop">Best Sellers</Link>
          </div>

          <div className="footer-column">
            <h3>Customer Care</h3>
            <Link to="/orders">Track Order</Link>
            <Link to="/orders">Returns</Link>
            <Link to="/orders">Shipping</Link>
            <Link to="/about">Contact Us</Link>
          </div>

          <div className="footer-newsletter">
            <h3>Stay in the loop</h3>

            <p>
              Get updates about new products and special offers.
            </p>

            {subscribed ? (
              <div className="newsletter-success">
                ✓ Thanks for subscribing!
              </div>
            ) : (
              <form
                className="newsletter"
                onSubmit={handleSubscribe}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Your email address"
                  aria-label="Your email address"
                  required
                />

                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                >
                  →
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="footer-bottom container">
          <span>© 2026 ShopVerse. All rights reserved.</span>
          <span>
            Built for a better shopping experience.
          </span>
        </div>
      </footer>
    </main>
  );
}

export default Home;