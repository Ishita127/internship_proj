import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../services/api";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

const normalizeCartItem = (item) => {
  const product = item?.product_id;

  if (!product) {
    return null;
  }

  return {
    cartItemId: item._id,
    id: product._id,
    name: product.name,
    description: product.description,
    categoryId: product.category_id,
    price: product.price,
    discount: product.discount || 0,
    stock: product.stock,
    image: product.image,
    status: product.status,
    quantity: Number(item.quantity || 1),

    category: product.category || "Product",
    rating: product.rating || 0,
    reviews: product.reviews || 0,
  };
};

const extractCartItems = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  return [];
};

const extractCartSummary = (data) => {
  if (data?.summary) {
    return data.summary;
  }

  if (data?.data?.summary) {
    return data.data.summary;
  }

  return null;
};

const normalizeCartResponse = (data) => {
  const items = extractCartItems(data);
  const summary = extractCartSummary(data);

  return {
    items: items
      .map(normalizeCartItem)
      .filter(Boolean),
    summary,
  };
};

const calculateFallbackSummary = (items) => {
  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const deliveryCharges =
    subtotal > 0 && subtotal <= 500
      ? 50
      : 0;

  const discount = 0;

  const total =
    subtotal +
    deliveryCharges -
    discount;

  return {
    subtotal,
    deliveryCharges,
    discount,
    total,
  };
};

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        setCartSummary(null);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getCart();

        if (cancelled) {
          return;
        }

        const normalized = normalizeCartResponse(data);

        setCartItems(normalized.items);
        setCartSummary(normalized.summary);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load your cart."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const refreshCart = async () => {
    const data = await getCart();
    const normalized = normalizeCartResponse(data);

    setCartItems(normalized.items);
    setCartSummary(normalized.summary);

    return normalized;
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error(
        "Please sign in to add products to your cart."
      );
    }

    if (!product?.id) {
      throw new Error(
        "Unable to add this product because its ID is missing."
      );
    }

    setError("");

    try {
      await addCartItem(product.id, quantity);

      await refreshCart();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to add this product to your cart.";

      setError(message);

      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    const item = cartItems.find(
      (cartItem) =>
        String(cartItem.id) === String(productId)
    );

    if (!item) {
      return;
    }

    setError("");

    try {
      await removeCartItem(item.cartItemId);

      await refreshCart();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to remove this item."
      );

      throw err;
    }
  };

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    const item = cartItems.find(
      (cartItem) =>
        String(cartItem.id) === String(productId)
    );

    if (!item) {
      return;
    }

    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setError("");

    try {
      await updateCartItem(
        item.cartItemId,
        quantity
      );

      await refreshCart();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update item quantity."
      );

      throw err;
    }
  };

  const clearCart = async () => {
    if (cartItems.length === 0) {
      return;
    }

    setError("");

    try {
      await Promise.all(
        cartItems.map((item) =>
          removeCartItem(item.cartItemId)
        )
      );

      setCartItems([]);
      setCartSummary(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to clear your cart."
      );

      throw err;
    }
  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const fallbackSummary =
    calculateFallbackSummary(cartItems);

  const cartSubtotal =
    Number(
      cartSummary?.subtotal ??
        fallbackSummary.subtotal
    );

  const shipping =
    Number(
      cartSummary?.delivery_charges ??
        fallbackSummary.deliveryCharges
    );

  const discount =
    Number(
      cartSummary?.discount ??
        fallbackSummary.discount
    );

  const total =
    Number(
      cartSummary?.total ??
        fallbackSummary.total
    );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        shipping,
        discount,
        total,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}