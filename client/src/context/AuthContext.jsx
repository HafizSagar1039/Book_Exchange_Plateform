import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../config";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  const API_URL = "http://localhost:5000/api"

  // Load user from token if present
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user data from token
  const loadUser = async () => {
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/users/me`, config);
      if (response.data.success) {
        setCurrentUser(response.data.user);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem("token");
        setToken(null);
        setCurrentUser(null);
      }
    } catch (error) {
      // If token is invalid or expired
      localStorage.removeItem("token");
      setToken(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data", // important for file upload
        },
      };

      const response = await axios.post(
        `${API_URL}/auth/register`,
        formData,
        config
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setCurrentUser(response.data.user);
        toast.success("Registration successful!");
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setCurrentUser(response.data.user);
        toast.success("Login successful!");
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
    toast.info("You have been logged out");
  };

  // Update profile
  const updateProfile = async (first_name,last_name, address, bio) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/users/me`,
        {
          first_name,
          last_name,
          address,
        },
        config
      );

      if (response.data.success) {
        setCurrentUser(response.data.user);
        toast.success("Profile updated successfully");
        return response.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      if (response.data.success) {
        toast.success("Password reset instructions sent to your email");
        return response.data;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset instructions"
      );
      throw error;
    }
  };
// Add this to your existing AuthContext

const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/reset-password`,
      { token, password: newPassword }
    );
    return response.data;
  } catch (error) {
    // Enhance error handling
    if (error.response) {
      throw new Error(error.response.data.message || 'Password reset failed');
    } else {
      throw new Error('Network error during password reset');
    }
  }
};


  const value = {
    currentUser,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    forgotPassword,
    loadUser,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
