import React, { useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import config from "../config";

const API_URL = config.API_URL;

const AddToWishlistButton = ({ book }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { currentUser } = useAuth();

  const handleAddToWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/users/wishlist`,
        {
          title: book.title,
          author: book.author,
          genre: book.genre,
          book_id: book.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess("Book added to your wishlist!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Button variant="outline-secondary" disabled>
        Login to add to wishlist
      </Button>
    );
  }

  return (
    <div className="mt-3">
      {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
      {success && <Alert variant="success" className="mb-2">{success}</Alert>}
      
      <Button
        variant="outline-primary"
        onClick={handleAddToWishlist}
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" className="me-2" />
            Adding...
          </>
        ) : (
          <>
            <i className="fas fa-heart me-2"></i>
            Add to Wishlist
          </>
        )}
      </Button>
    </div>
  );
};

export default AddToWishlistButton;