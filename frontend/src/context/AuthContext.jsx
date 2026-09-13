import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(false);

  // Keep authentication data synchronized with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);

    try {
      const response = await registerUser(userData);

      return response;
    } finally {
      setLoading(false);
    }
  };

  // Log in the user and store authentication data
  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await loginUser(credentials);

      const loggedInUser = response.data.user;
      const loggedInToken = response.data.token;

      setUser(loggedInUser);
      setToken(loggedInToken);

      return response;
    } finally {
      setLoading(false);
    }
  };

  // Update the current user's information across the application
  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  // Log out the current user
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};