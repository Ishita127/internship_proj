import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/common/Navbar";
import AdminLayout from "./components/admin/AdminLayout";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/customer/Home";
import Shop from "./pages/customer/Shop";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Wishlist from "./pages/customer/Wishlist";
import Login from "./pages/customer/Login";
import Signup from "./pages/customer/Signup";
import Categories from "./pages/customer/Categories";
import About from "./pages/customer/About";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import OrderDetails from "./pages/customer/OrderDetails";
import Profile from "./pages/customer/Profile";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCustomerOrders from "./pages/admin/AdminCustomerOrders";

const AppContent = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isAdmin = isAuthenticated && user?.role === "admin";
  const isAdminPage = location.pathname.startsWith("/admin");

  // Admin users should stay inside the admin area.
  if (isAdmin && !isAdminPage) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* Storefront */}

        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route path="/about" element={<About />} />

        {/* Customer */}

        <Route path="/cart" element={<Cart />} />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* Admin */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          {/* Dashboard */}

          <Route
            index
            element={<AdminDashboard />}
          />

          {/* Products */}

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

          {/* Categories */}

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          {/* Orders */}

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="orders/:id"
            element={<AdminOrderDetails />}
          />

          {/* Customers */}

          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          <Route
            path="customers/:customerId/orders"
            element={<AdminCustomerOrders />}
          />

          {/* Reviews */}

          <Route
            path="reviews"
            element={<AdminReviews />}
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