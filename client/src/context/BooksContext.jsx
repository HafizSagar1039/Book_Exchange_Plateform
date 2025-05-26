import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const BooksContext = createContext();

export const useBooks = () => useContext(BooksContext);

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Set up axios defaults
  const API_URL = "http://localhost:5000/api";

  // Get all books with optional search filters
const getBooks = useCallback(
  async (search = "", genre = "") => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_URL}/books?`;

      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (genre) url += `genre=${encodeURIComponent(genre)}&`;

      const response = await axios.get(url);

      if (response.data.success) {
        setBooks(response.data.books);
        return response.data.books;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch books");
      toast.error("Error loading books");
    } finally {
      setLoading(false);
    }
  },
  []
);


  // Get a single book by ID
  const getBookById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/books/${id}`);

      if (response.data.success) {
        return response.data.book;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch book");
      toast.error("Error loading book details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current user's books
  const getMyBooks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/books/user/me`, config);

      if (response.data.success) {
        setMyBooks(response.data.books);
        return response.data.books;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your books");
      toast.error("Error loading your books");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Add a new book
  const addBook = async (formData) => {
    if (!token) {
      toast.error("You must be logged in to add a book");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/books`, formData, config);

      if (response.data.success) {
        toast.success("Book added successfully");

        return response.data.book;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add book");
      toast.error("Error adding book");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a book
  const updateBook = async (id, formData) => {
    if (!token) {
      toast.error("You must be logged in to update a book");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };


      const response = await axios.put(
        `${API_URL}/books/${id}`,
        formData,
        config
      );

      if (response.data.success) {
        // Update the book in myBooks state
        setMyBooks((prevBooks) =>
          prevBooks.map((book) => (book.id === id ? response.data.book : book))
        );

        toast.success("Book updated successfully");
        return response.data.book;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update book");
      toast.error("Error updating book");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a book
  const deleteBook = async (id) => {
    if (!token) {
      toast.error("You must be logged in to delete a book");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.delete(`${API_URL}/books/${id}`, config);

      if (response.data.success) {
        // Remove the book from myBooks state
        setMyBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));

        toast.success("Book deleted successfully");
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete book");
      toast.error("Error deleting book");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update book availability status
  const updateBookStatus = async (id, isAvailable) => {
    if (!token) {
      toast.error("You must be logged in to update book status");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/books/${id}/status`,
        { isAvailable },
        config
      );

      if (response.data.success) {
        // Update the book status in myBooks state
        setMyBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.BookID === id ? { ...book, book_condition: isAvailable } : book
          )
        );
        toast.success(response.data.message);

        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update book status");
      toast.error("Error updating book status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    books,
    myBooks,
    loading,
    error,
    getBooks,
    getBookById,
    getMyBooks,
    addBook,
    updateBook,
    deleteBook,
    updateBookStatus,
  };

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
};
