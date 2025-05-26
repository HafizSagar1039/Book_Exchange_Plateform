import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import config from "../config";
const ExchangeContext = createContext();

const API_URL = config.API_URL;
export const useExchange = () => useContext(ExchangeContext);

export const ExchangeProvider = ({ children }) => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, currentUser } = useAuth();

  // Set up axios defaults

  // Get all exchanges for current user
  const getExchanges = useCallback(async () => {
    if (!token) return [];

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/exchanges`, config);

      if (response.data.success) {
        setExchanges(response.data.exchanges);
        return response.data.exchanges;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch exchanges");
      toast.error("Error loading exchanges");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get exchange by ID
  const getExchangeById = async (id) => {
    if (!token) return null;

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/exchanges/${id}`, config);

      if (response.data.success) {
        return response.data.exchange;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch exchange");
      toast.error("Error loading exchange details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request book exchange
  const requestExchange = async (bookId, message) => {
    if (!token) {
      toast.error("You must be logged in to request a book");
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

      const response = await axios.post(
        `${API_URL}/exchanges/request`,
        { book_id: bookId, message },
        config
      );

      if (response.data.success) {
        toast.success("Exchange request sent successfully");
        return response.data.exchange;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send exchange request"
      );
      toast.error(err.response?.data?.message || "Error sending request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject exchange request
  const respondToExchange = async (exchangeId, status) => {
    if (!token) {
      toast.error("You must be logged in to respond to a request");
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
        `${API_URL}/exchanges/${exchangeId}/approve`,
        { status },
        config
      );

      if (response.data.success) {
        // Update the exchange in the exchanges state
        setExchanges((prevExchanges) =>
          prevExchanges.map((exchange) =>
            exchange.id === exchangeId ? { ...exchange, status } : exchange
          )
        );

        toast.success(
          `Exchange ${
            status === "approved" ? "approved" : "rejected"
          } successfully`
        );
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update exchange");
      toast.error("Error updating exchange status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get messages for an exchange
  const getMessages = async (exchangeId) => {
    if (!token) return [];

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${API_URL}/messages/${exchangeId}`,
        config
      );

      if (response.data.success) {
        return response.data.messages;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch messages");
      toast.error("Error loading messages");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (exchangeId, message) => {
    console.log(exchangeId, message);
    if (!token) {
      toast.error("You must be logged in to send a message");
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

      const response = await axios.post(
        `${API_URL}/messages`,
        { exchange_id: exchangeId, message },
        config
      );

      if (response.data.success) {
        return response.data.sentMessage;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
      toast.error("Error sending message");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    exchanges,
    loading,
    error,
    getExchanges,
    getExchangeById,
    requestExchange,
    respondToExchange,
    getMessages,
    sendMessage,
  };

  return (
    <ExchangeContext.Provider value={value}>
      {children}
    </ExchangeContext.Provider>
  );
};
