import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Page Components
import HomePage from "./pages/HomePage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookDetailsPage from "./pages/BookDetailsPage";
import AddBookPage from "./pages/AddBookPage";
import EditBookPage from "./pages/EditBookPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MessagingPage from "./pages/MessagingPage";
import ExchangePage from "./pages/ExchangePage";
import AboutUs from "./pages/AboutUs";
import ResetPasswordPage from "./pages/ResetPassword";
// Context
import { AuthProvider } from "./context/AuthContext";
import { BooksProvider } from "./context/BooksContext";
import { ExchangeProvider } from "./context/ExchangeContext";

// Add this component INSIDE your <Router>
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Instantly scrolls to top on route change
  }, [pathname]);

  return null; // This component doesn't render anything
}

// Private Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  return token ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-loader">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading BookBridge...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BooksProvider>
        <ExchangeProvider>
          <Router>
            <ScrollToTop />
            <div className="app-container d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1 py-4">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route
                    path="/reset-password/:token"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="/books/:id" element={<BookDetailsPage />} />

                  <Route
                    path="/add-book"
                    element={
                      <PrivateRoute>
                        <AddBookPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/edit-book/:id"
                    element={
                      <PrivateRoute>
                        <EditBookPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <DashboardPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/messages/:exchangeId"
                    element={
                      <PrivateRoute>
                        <MessagingPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/exchanges/:id"
                    element={
                      <PrivateRoute>
                        <ExchangePage />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
          </Router>
        </ExchangeProvider>
      </BooksProvider>
    </AuthProvider>
  );
}

export default App;
