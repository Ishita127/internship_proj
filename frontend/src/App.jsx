import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminProductForm from "./pages/AdminProductForm";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminCustomers from "./pages/AdminCustomers";

const AppContent = () => {
  const location = useLocation();

  // Hide the storefront navbar inside the admin panel.
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* ==================== STOREFRONT ==================== */}

        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/categories" element={<Categories />} />

        <Route path="/about" element={<About />} />

        {/* ==================== CUSTOMER ==================== */}

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/wishlist" element={<Wishlist />} />

        {/* Customer Orders */}
        <Route
          path="/orders"
          element={<Orders />}
        />

        {/* Customer Order Details */}
        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ==================== AUTHENTICATION ==================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ==================== ADMIN ==================== */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          {/* Dashboard */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* ==================== PRODUCTS ==================== */}

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="products/new"
            element={<AdminProductForm />}
          />

          <Route
            path="products/:id/edit"
            element={<AdminProductForm />}
          />

          {/* ==================== CATEGORIES ==================== */}

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          {/* ==================== ORDERS ==================== */}

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="orders/:id"
            element={<AdminOrderDetails />}
          />

          {/* ==================== CUSTOMERS ==================== */}

          <Route
            path="customers"
            element={<AdminCustomers />}
          />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;