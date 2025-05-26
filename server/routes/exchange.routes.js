// exchanges.js
import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import db from "../config/db.js";
import { sendNotification } from "../utils/notificationController.js";
const router = express.Router();

// @route   GET api/exchanges
// @desc    Get all exchanges for current user (sent and received)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const query = `
      SELECT e.*, 
        b.Title, b.Author, b.BookImage,
        requester.first_name as requester_name, requester.email as requester_email,
        owner.first_name as owner_name, owner.email as owner_email
      FROM bookexchange e
      JOIN book b ON e.BookID = b.BookID
      JOIN users requester ON e.SeekerID = requester.id
      JOIN users owner ON b.OwnerID = owner.id
      WHERE e.SeekerID = ? OR b.OwnerID = ?
      ORDER BY e.created_at DESC
    `;

    const [exchanges] = await db.query(query, [req.userId, req.userId]);

    res.json({
      success: true,
      count: exchanges.length,
      exchanges,
    });
  } catch (error) {
    console.error("Get exchanges error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET api/exchanges/:id
// @desc    Get a specific exchange
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*, 
        b.Title, b.Author, b.BookImage AS BookImage, b.OwnerID,
        requester.first_name AS requester_name, requester.email AS requester_email, requester.id AS requester_id,
        owner.first_name AS owner_name, owner.email AS owner_email, owner.id AS owner_id
      FROM bookexchange e
      JOIN book b ON e.BookID = b.BookID
      JOIN users requester ON e.SeekerID = requester.id
      JOIN users owner ON b.OwnerID = owner.id
      WHERE e.id = ?
    `;

    const [exchanges] = await db.query(query, [req.params.id]);

    if (exchanges.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Exchange not found" });
    }

    const exchange = exchanges[0];

    // Secure authorization check
    if (
      exchange.requester_id !== req.userId &&
      exchange.owner_id !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this exchange",
      });
    }

    return res.status(200).json({ success: true, exchange });
  } catch (error) {
    console.error("Get exchange error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching exchange",
    });
  }
});

// @route   POST api/exchanges/request
// @desc    Create a new exchange request
// @access  Private
router.post(
  "/request",
  [
    auth,
    body("book_id").isNumeric().withMessage("Book ID is required"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { book_id, message } = req.body;

    try {
      const [books] = await db.query(
        'SELECT * FROM book WHERE BookID = ? AND book_condition = "Available"',
        [book_id]
      );

      if (books.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Book not found or not available",
        });
      }

      const book = books[0];

      if (book.OwnerID === req.userId) {
        return res.status(400).json({
          success: false,
          message: "Cannot request your own book",
        });
      }

      const [existingRequests] = await db.query(
        'SELECT * FROM bookexchange WHERE BookID = ? AND SeekerID = ? AND ExchangeStatus = "Pending"',
        [book_id, req.userId]
      );

      if (existingRequests.length > 0) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending request for this book",
        });
      }

      const [result] = await db.query(
        `INSERT INTO bookexchange (
          BookID, OwnerID, SeekerID, message, ExchangeStatus, ExchangeDate, created_at
        ) VALUES (?, ?, ?, ?, 'Pending', NOW(), NOW())`,
        [book_id, book.OwnerID, req.userId, message]
      );

      const [exchanges] = await db.query(
        `SELECT e.*, 
          b.Title, b.Author, b.BookImage,
          requester.first_name as requester_name,
          owner.first_name as owner_name
        FROM bookexchange e
        JOIN book b ON e.BookID = b.BookID
        JOIN users requester ON e.SeekerID = requester.id
        JOIN users owner ON e.OwnerID = owner.id
        WHERE e.id = ?`,
        [result.insertId]
      );
       const exchange = exchanges[0];
      await sendNotification(
        exchange.OwnerID,
        `Your book "${exchange.Title}" has been requested by ${exchange.requester_name}.`
      );
      res.status(201).json({
        success: true,
        message: "Exchange request sent successfully",
        exchange: exchanges[0],
      });
    } catch (error) {
      console.error("Create exchange error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @route   PUT api/exchanges/:id/approve
// @desc    Approve or reject an exchange request
// @access  Private
router.put(
  "/:id/approve",
  [
    auth,
    body("status")
      .isIn(["Approved", "Rejected"])
      .withMessage("Status must be either Approved or Rejected"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status } = req.body;
    const exchangeId = req.params.id;
    const userId = req.userId;

    try {
      // 1. Get exchange with book and owner info
      const [exchanges] = await db.query(
        `SELECT e.*,e.SeekerID AS requester_id, b.BookID, b.OwnerID as book_owner_id, b.book_condition
         FROM bookexchange e
         JOIN book b ON e.BookID = b.BookID
         WHERE e.id = ?`,
        [exchangeId]
      );

      if (exchanges.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Exchange not found",
        });
      }

      const exchange = exchanges[0];

      // 2. Verify requesting user is the book owner
      if (exchange.book_owner_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Only the book owner can approve/reject exchanges",
        });
      }

      // 3. Check current status
      if (exchange.ExchangeStatus !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Exchange is already ${exchange.status}`,
        });
      }

      // 4. Check book availability based on book_condition column
      if (status === "Approved" && exchange.book_condition !== "Available") {
        return res.status(400).json({
          success: false,
          message: "Book is no longer available",
        });
      }
      // 5. Update exchange status
      await db.query(
        "UPDATE bookexchange SET ExchangeStatus = ? WHERE id = ?",
        [status, exchangeId]
      );
      // 6. If approved, mark book as Reserved
      if (status === "Approved") {
        await db.query("UPDATE book SET book_condition = ? WHERE BookID = ?", [
          "Reserved",
          exchange.BookID,
        ]);
      }
      const note =
        status === "Approved"
          ? `Your exchange request for "${exchange.Title}" was approved!`
          : `Your exchange request for "${exchange.Title}" was rejected.`;

      if (!exchange.requester_id) {
        console.warn("Missing requester_id, skipping notification");
      } else {
        await sendNotification(exchange.requester_id, note);
      }

      res.json({
        success: true,
        message: `Exchange ${status} successfully`,
      });
    } catch (error) {
      console.error("Update exchange error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating exchange",
      });
    }
  }
);

// @route   DELETE api/exchanges/:id
// @desc    Cancel an exchange request
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Cancel exchange request:", req.params.id, req.user.id);
    // 1. Validate exchange exists and belongs to requester
    const [exchanges] = await db.query(
      `SELECT e.* 
       FROM bookexchange e
       JOIN book b ON e.BookID = b.BookID
       WHERE e.id = ? AND e.SeekerID = ? AND e.ExchangeStatus = 'Pending'`,
      [req.params.id, req.user.id]
    );

    if (exchanges.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pending exchange request not found or unauthorized",
      });
    }

    // 2. Delete the exchange
    await db.query("DELETE FROM bookexchange WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Exchange request cancelled",
    });
  } catch (error) {
    console.error("DELETE Exchange Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during cancellation",
    });
  }
});

export default router;
