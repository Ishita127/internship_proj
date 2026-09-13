import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "../services/api";

import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

const getId = (item) => {
  return item?._id || item?.id || "";
};

// Converts a backend wishlist document into the product format used by the UI.
const normalizeWishlistItem = (item) => {
  const product = item?.product_id;

  if (!product) {
    return null;
  }

  const productId = getId(product);
  const wishlistId = getId(item);

  return {
    id: productId,
    wishlistId,

    name: product?.name || "Untitled Product",

    description: product?.description || "",

    categoryId:
      typeof product?.category_id === "object"
        ? product?.category_id?._id
        : product?.category_id || "",

    category:
      product?.category ||
      product?.category_id?.category_name ||
      "Product",

    price: Number(product?.price || 0),

    discount: Number(product?.discount || 0),

    stock: Number(product?.stock || 0),

    image: product?.image || "",

    status: product?.status || "Active",

    rating: product?.rating || 0,

    reviews: product?.reviews || 0,
  };
};

// Handles the response formats returned by the wishlist API.
const extractWishlist = (response) => {
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
};

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Loads the current user's wishlist when authentication changes.
  useEffect(() => {
    let cancelled = false;

    const loadWishlist = async () => {
      if (!isAuthenticated) {
        setWishlistItems([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getWishlist();

        if (cancelled) {
          return;
        }

        const wishlist = extractWishlist(response);

        const normalizedItems = wishlist
          .map(normalizeWishlistItem)
          .filter(Boolean);

        setWishlistItems(normalizedItems);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load your wishlist."
          );

          setWishlistItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Adds a product to the authenticated user's wishlist.
  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      throw new Error(
        "Please sign in to add products to your wishlist."
      );
    }

    const productId = getId(product);

    if (!productId) {
      throw new Error("Unable to add this product.");
    }

    setError("");

    try {
      const response = await addWishlistItem(productId);

      const wishlistDocument =
        response?.data || response;

      const wishlistId =
        wishlistDocument?._id || "";

      setWishlistItems((currentItems) => {
        const alreadyExists = currentItems.some(
          (item) => item.id === productId
        );

        if (alreadyExists) {
          return currentItems;
        }

        return [
          ...currentItems,
          {
            ...product,
            id: productId,
            wishlistId,

            categoryId:
              typeof product?.categoryId === "object"
                ? product?.categoryId?._id
                : product?.categoryId || "",

            price: Number(product?.price || 0),

            stock: Number(product?.stock || 0),

            discount: Number(product?.discount || 0),

            image: product?.image || "",
          },
        ];
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to add this product to your wishlist."
      );

      throw err;
    }
  };

  // Removes a product using its corresponding wishlist document ID.
  const removeFromWishlist = async (productId) => {
    setError("");

    const wishlistItem = wishlistItems.find(
      (item) => item.id === productId
    );

    if (!wishlistItem) {
      return;
    }

    const wishlistId = wishlistItem.wishlistId;

    if (!wishlistId) {
      setError(
        "Unable to remove this wishlist item."
      );

      throw new Error(
        "Wishlist item ID is missing."
      );
    }

    try {
      await removeWishlistItem(wishlistId);

      setWishlistItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== productId
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to remove this product from your wishlist."
      );

      throw err;
    }
  };

  // Adds or removes a product based on its current wishlist state.
  const toggleWishlist = async (product) => {
    const productId = getId(product);

    if (!productId) {
      throw new Error(
        "Unable to update wishlist."
      );
    }

    const existingItem = wishlistItems.find(
      (item) => item.id === productId
    );

    if (existingItem) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist({
        ...product,
        id: productId,
      });
    }
  };

  // Checks whether a product is currently in the wishlist.
  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.id === productId
    );
  };

  // Removes all wishlist items from the backend and local state.
  const clearWishlist = async () => {
    if (wishlistItems.length === 0) {
      return;
    }

    setError("");

    try {
      await Promise.all(
        wishlistItems.map((item) => {
          if (!item.wishlistId) {
            throw new Error(
              "A wishlist item ID is missing."
            );
          }

          return removeWishlistItem(
            item.wishlistId
          );
        })
      );

      setWishlistItems([]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to clear your wishlist."
      );

      throw err;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}