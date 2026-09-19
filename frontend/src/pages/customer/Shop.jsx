import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../../components/common/ProductCard";

import {
  getCategories,
  getProductReviews,
  getProducts,
} from "../../services/api";

import "./Shop.css";

const PRODUCTS_PER_PAGE = 12;

// Get a consistent ID from backend objects.
function getId(item) {
  return item?._id || item?.id || "";
}

// Support the different response formats returned by the API.
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

// Resolve the category name from populated data or category ID.
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

function Shop() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  // Store products, categories and product rating data.
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productRatings, setProductRatings] =
    useState({});

  // Store loading, error and retry state.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Read search and category values from the URL.
  const urlSearch =
    searchParams.get("search") || "";

  const urlCategoryValues =
    searchParams.get("category")
      ? searchParams
          .get("category")
          .split(",")
          .filter(Boolean)
      : [];

  // Store the active shop filters.
  const [search, setSearch] =
    useState(urlSearch);

  const [selectedCategories, setSelectedCategories] =
    useState([]);

  const [minPrice, setMinPrice] =
    useState(0);

  const [maxPrice, setMaxPrice] =
    useState(null);

  const [minRating, setMinRating] =
    useState(0);

  const [sort, setSort] =
    useState("featured");

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  // Load products, categories and their review ratings.
  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const productData =
          extractList(productsResponse);

        const categoryData =
          extractList(categoriesResponse);

        setProducts(productData);
        setCategories(categoryData);

        const ratings = {};

        await Promise.all(
          productData.map(async (product) => {
            try {
              const productId =
                getId(product);

              if (!productId) {
                return;
              }

              const reviewsResponse =
                await getProductReviews(
                  productId
                );

              const reviews =
                extractList(
                  reviewsResponse
                );

              if (reviews.length === 0) {
                ratings[productId] = {
                  rating: 0,
                  reviews: 0,
                };

                return;
              }

              const totalRating =
                reviews.reduce(
                  (sum, review) =>
                    sum +
                    Number(
                      review?.rating || 0
                    ),
                  0
                );

              ratings[productId] = {
                rating:
                  totalRating /
                  reviews.length,
                reviews:
                  reviews.length,
              };
            } catch (reviewError) {
              console.error(
                `Failed to load reviews for product ${getId(
                  product
                )}:`,
                reviewError
              );

              const productId =
                getId(product);

              if (productId) {
                ratings[productId] = {
                  rating: 0,
                  reviews: 0,
                };
              }
            }
          })
        );

        setProductRatings(ratings);
      } catch (err) {
        console.error(
          "Failed to load shop data:",
          err
        );

        setProducts([]);
        setCategories([]);
        setProductRatings({});

        setError(
          err?.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [retryKey]);

  // Convert category names or IDs from the URL into backend category IDs.
  useEffect(() => {
    setSearch(urlSearch);

    if (urlCategoryValues.length === 0) {
      setSelectedCategories([]);
      setCurrentPage(1);
      return;
    }

    if (categories.length > 0) {
      const resolvedCategoryIds =
        urlCategoryValues
          .map((value) => {
            const decodedValue =
              decodeURIComponent(value);

            const directMatch =
              categories.find(
                (category) =>
                  getId(category) ===
                  decodedValue
              );

            if (directMatch) {
              return getId(
                directMatch
              );
            }

            const nameMatch =
              categories.find(
                (category) =>
                  String(
                    category?.category_name ||
                      ""
                  )
                    .trim()
                    .toLowerCase() ===
                  decodedValue
                    .trim()
                    .toLowerCase()
              );

            return nameMatch
              ? getId(nameMatch)
              : null;
          })
          .filter(Boolean);

      setSelectedCategories(
        resolvedCategoryIds
      );

      setCurrentPage(1);
    }
  }, [
    urlSearch,
    searchParams,
    categories,
  ]);

  // Calculate the highest available product price.
  const availableMaxPrice =
    useMemo(() => {
      if (products.length === 0) {
        return 5000;
      }

      const highestPrice =
        Math.max(
          ...products.map(
            (product) =>
              Number(
                product?.price || 0
              )
          )
        );

      return Math.max(
        5000,
        Math.ceil(highestPrice)
      );
    }, [products]);

  useEffect(() => {
    if (maxPrice === null) {
      setMaxPrice(
        availableMaxPrice
      );
    }
  }, [
    availableMaxPrice,
    maxPrice,
  ]);

  // Normalize product data for filtering and display.
  const normalizedProducts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return products
        .map((product) => {
          const categoryName =
            getCategoryName(
              product,
              categories
            );

          const productId =
            getId(product);

          const ratingData =
            productRatings[
              productId
            ] || {
              rating: 0,
              reviews: 0,
            };

          return {
            id: productId,

            name:
              product?.name ||
              "Unnamed Product",

            description:
              product?.description ||
              "",

            category:
              categoryName,

            categoryId:
              typeof product?.category_id ===
              "string"
                ? product.category_id
                : product?.category_id?._id ||
                  "",

            price:
              Number(
                product?.price
              ) || 0,

            discount:
              Number(
                product?.discount
              ) || 0,

            stock:
              Number(
                product?.stock
              ) || 0,

            status:
              product?.status,

            image:
              product?.image || "",

            rating:
              ratingData.rating,

            reviews:
              ratingData.reviews,

            sale:
              Number(
                product?.discount
              ) > 0,

            created_at:
              product?.created_at,
          };
        })
        .filter((product) => {
          const matchesSearch =
            !query ||
            product.name
              .toLowerCase()
              .includes(query) ||
            product.description
              .toLowerCase()
              .includes(query) ||
            product.category
              .toLowerCase()
              .includes(query);

          return matchesSearch;
        });
    }, [
      products,
      categories,
      productRatings,
      search,
    ]);

  // Apply category, price, rating and sorting filters.
  const filteredProducts =
    useMemo(() => {
      let result =
        normalizedProducts.filter(
          (product) => {
            const matchesCategory =
              selectedCategories.length ===
                0 ||
              selectedCategories.includes(
                product.categoryId
              );

            const matchesPrice =
              product.price >=
                minPrice &&
              product.price <=
                (maxPrice ??
                  availableMaxPrice);

            const matchesRating =
              minRating === 0 ||
              product.rating >=
                minRating;

            const isActive =
              product.status !==
              "Inactive";

            return (
              matchesCategory &&
              matchesPrice &&
              matchesRating &&
              isActive
            );
          }
        );

      if (sort === "price-low") {
        result.sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (sort === "price-high") {
        result.sort(
          (a, b) =>
            b.price - a.price
        );
      }

      if (sort === "rating") {
        result.sort(
          (a, b) =>
            b.rating - a.rating
        );
      }

      if (sort === "newest") {
        result.sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
        );
      }

      return result;
    }, [
      normalizedProducts,
      selectedCategories,
      minPrice,
      maxPrice,
      availableMaxPrice,
      minRating,
      sort,
    ]);

  // Calculate pagination values and the products for the current page.
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProducts.length /
          PRODUCTS_PER_PAGE
      )
    );

  const paginatedProducts =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        PRODUCTS_PER_PAGE;

      return filteredProducts.slice(
        startIndex,
        startIndex +
          PRODUCTS_PER_PAGE
      );
    }, [
      filteredProducts,
      currentPage,
    ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // Keep product search synchronized with the URL.
  const handleSearchChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSearch(value);
    setCurrentPage(1);

    const params =
      new URLSearchParams(
        searchParams
      );

    if (value.trim()) {
      params.set(
        "search",
        value.trim()
      );
    } else {
      params.delete(
        "search"
      );
    }

    setSearchParams(params);
  };

  const clearSearch = () => {
    const params =
      new URLSearchParams(
        searchParams
      );

    params.delete("search");

    setSearch("");
    setCurrentPage(1);

    setSearchParams(params);
  };

  // Toggle category filters and synchronize them with the URL.
  const toggleCategory = (
    categoryId
  ) => {
    const updated =
      selectedCategories.includes(
        categoryId
      )
        ? selectedCategories.filter(
            (id) =>
              id !== categoryId
          )
        : [
            ...selectedCategories,
            categoryId,
          ];

    setSelectedCategories(
      updated
    );

    setCurrentPage(1);

    const params =
      new URLSearchParams(
        searchParams
      );

    if (updated.length > 0) {
      params.set(
        "category",
        updated.join(",")
      );
    } else {
      params.delete(
        "category"
      );
    }

    setSearchParams(params);
  };

  // Reset all shop filters.
  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(
      availableMaxPrice
    );
    setMinRating(0);
    setSort("featured");
    setCurrentPage(1);

    setSearchParams({});
  };

  return (
    <main className="shop-page">
      {/* Page header */}
      <section className="shop-header">
        <div className="container">
          <span className="section-label">
            OUR COLLECTION
          </span>

          <h1>
            Shop All Products
          </h1>

          <p>
            Discover carefully selected products
            designed for modern everyday living.
          </p>
        </div>
      </section>

      {/* Shop content */}
      <section className="shop-content container">
        {/* Search and sorting toolbar */}
        <div className="shop-toolbar">
          <div className="shop-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={
                handleSearchChange
              }
            />

            {search && (
              <button
                type="button"
                onClick={
                  clearSearch
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="shop-toolbar-right">
            <span className="product-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length ===
              1
                ? "product"
                : "products"}
            </span>

            <button
              type="button"
              className="mobile-filter-button"
              onClick={() =>
                setMobileFilters(
                  (current) =>
                    !current
                )
              }
            >
              Filters
            </button>

            <select
              value={sort}
              onChange={(event) => {
                setSort(
                  event.target.value
                );

                setCurrentPage(1);
              }}
              className="sort-select"
              aria-label="Sort products"
            >
              <option value="featured">
                Sort: Featured
              </option>

              <option value="newest">
                Sort: Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Rating: Highest
              </option>
            </select>
          </div>
        </div>

        {/* Shop layout */}
        <div className="shop-layout">
          {/* Filter sidebar */}
          <aside
            className={`filters-sidebar ${
              mobileFilters
                ? "filters-open"
                : ""
            }`}
          >
            <div className="filter-header">
              <h2>Filters</h2>

              <button
                type="button"
                onClick={
                  clearFilters
                }
              >
                Clear all
              </button>
            </div>

            {/* Category filters */}
            <div className="filter-group">
              <h3>Categories</h3>

              {categories.length >
              0 ? (
                categories.map(
                  (category) => {
                    const categoryId =
                      getId(
                        category
                      );

                    return (
                      <label
                        className="filter-checkbox"
                        key={
                          categoryId
                        }
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(
                            categoryId
                          )}
                          onChange={() =>
                            toggleCategory(
                              categoryId
                            )
                          }
                        />

                        <span>
                          {
                            category?.category_name
                          }
                        </span>
                      </label>
                    );
                  }
                )
              ) : (
                <p>
                  No categories available.
                </p>
              )}
            </div>

            {/* Price filters */}
            <div className="filter-group">
              <h3>Price Range</h3>

              <div className="price-inputs">
                <div>
                  <label>Min</label>

                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => {
                      const value =
                        Math.max(
                          0,
                          Number(
                            event.target
                              .value
                          )
                        );

                      setMinPrice(
                        Math.min(
                          value,
                          maxPrice ??
                            availableMaxPrice
                        )
                      );

                      setCurrentPage(1);
                    }}
                  />
                </div>

                <span>—</span>

                <div>
                  <label>Max</label>

                  <input
                    type="number"
                    min={minPrice}
                    value={
                      maxPrice ??
                      availableMaxPrice
                    }
                    onChange={(event) => {
                      const rawValue =
                        event.target.value;

                      // Allow the field to be empty without turning the max price into ₹0.
                      if (rawValue === "") {
                        setMaxPrice(null);
                        setCurrentPage(1);
                        return;
                      }

                      const value =
                        Math.max(
                          minPrice,
                          Number(rawValue)
                        );

                      setMaxPrice(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <small className="price-range-note">
                Available products up to ₹
                {availableMaxPrice.toLocaleString(
                  "en-IN"
                )}
              </small>
            </div>

            {/* Rating filters */}
            <div className="filter-group">
              <h3>Rating</h3>

              {[4, 3, 2].map(
                (rating) => (
                  <label
                    className="rating-filter"
                    key={rating}
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={
                        minRating ===
                        rating
                      }
                      onChange={() => {
                        setMinRating(
                          rating
                        );

                        setCurrentPage(
                          1
                        );
                      }}
                    />

                    <span>
                      {"★".repeat(
                        rating
                      )}

                      <em>
                        & above
                      </em>
                    </span>
                  </label>
                )
              )}

              <label className="rating-filter">
                <input
                  type="radio"
                  name="rating"
                  checked={
                    minRating === 0
                  }
                  onChange={() => {
                    setMinRating(0);
                    setCurrentPage(1);
                  }}
                />

                <span>All ratings</span>
              </label>
            </div>
          </aside>

          {/* Products area */}
          <div className="products-area">
            {loading ? (
              <div className="no-products">
                <div className="no-products-icon">
                  ⏳
                </div>

                <h2>
                  Loading products...
                </h2>

                <p>
                  Please wait while we
                  load our collection.
                </p>
              </div>
            ) : error ? (
              <div className="no-products">
                <div className="no-products-icon">
                  !
                </div>

                <h2>
                  Unable to load
                  products
                </h2>

                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    setRetryKey(
                      (value) =>
                        value + 1
                    )
                  }
                >
                  Try Again
                </button>
              </div>
            ) : paginatedProducts.length >
              0 ? (
              <>
                <div className="shop-products-grid">
                  {paginatedProducts.map(
                    (product) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    )
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      aria-label="Previous page"
                    >
                      ←
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map(
                      (page) => (
                        <button
                          type="button"
                          key={page}
                          className={
                            currentPage ===
                            page
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">
                  ⌕
                </div>

                <h2>
                  No products found
                </h2>

                <p>
                  Try changing your
                  search or filters.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Shop;