import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import db from "../config/db.js";
import uploadProfile from "../middleware/bookcover.js";

const router = express.Router();

// ------------------------------
// GET /api/books
// Fetch all available books with optional filters
// ------------------------------
router.get("/", async (req, res) => {
  try {
    // Extract query parameters
    const { search, genre, location } = req.query;

    let sql = `
      SELECT b.*, u.first_name as owner_name, u.mobile 
      FROM book b 
      JOIN users u ON b.OwnerID = u.id
    `;
    const params = [];

    if (search) {
      sql += ` AND (b.Title LIKE ? OR b.Author LIKE ? OR b.description LIKE ?)`;
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }

    if (genre) {
      sql += ` AND b.Genre = ?`;
      params.push(genre);
    }

    if (location) {
      sql += ` AND u.location LIKE ?`;
      params.push(`%${location}%`);
    }

    sql += ` ORDER BY b.CreatedAt DESC`;

    const [books] = await db.query(sql, params);
    res.json({ success: true, count: books.length, books });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------
// GET /api/books/:id
// Fetch a single book by ID
// ------------------------------
router.get("/:id", async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, u.first_name as owner_name, u.last_name, u.mobile, u.email as owner_email 
       FROM book b 
       JOIN users u ON b.OwnerID = u.id 
       WHERE b.BookID = ?`,
      [req.params.id]
    );

    if (books.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    res.json({ success: true, book: books[0] });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------
// POST /api/books
// Add a new book (Protected)
// ------------------------------
router.post(
  "/",
  uploadProfile.single("picture"),
  [
    auth,
    body("title").notEmpty().withMessage("Title is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("genre").notEmpty().withMessage("Genre is required"),
    body("condition").notEmpty().withMessage("Condition is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, author, genre, condition, description } = req.body;
    const coverPic = req.file ? req.file.filename : null;

    try {
      const [result] = await db.query(
        `INSERT INTO book (
          Title, Author, Genre, book_condition, description, 
          BookImage, OwnerId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, author, genre, condition, description, coverPic, req.userId]
      );

      const [books] = await db.query("SELECT * FROM book WHERE BookID = ?", [
        result.insertId,
      ]);

      res.status(201).json({
        success: true,
        message: "Book added successfully",
        book: {
          id: books[0].BookID, // Custom ID key for frontend
          ...books[0], // Spread the rest of the book data
        },
      });
    } catch (error) {
      console.error("Add book error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ------------------------------
// PUT /api/books/:id
// Update a book (Protected)
// ------------------------------
router.put(
  "/:id",
  uploadProfile.single("image"),
  [
    auth,
    body("title").notEmpty(), 
    body("author").notEmpty(),
    body("genre").notEmpty(),
    body("condition").notEmpty(),
    body("description").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      // First get the existing book data
      const [books] = await db.query("SELECT * FROM book WHERE BookID = ?", [
        req.params.id,
      ]);

      if (books.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Book not found" });
      }

      if (books[0].OwnerID !== req.userId) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }

      const {
        title,
        author,
        genre,
        condition,
        description,
        currentImage // Add this to get the current image filename from the form
      } = req.body;

      // Determine which image to use:
      // 1. If new image uploaded, use that
      // 2. If no new image but currentImage exists, use that
      // 3. Otherwise, set to null (no image)
      const image = req.file 
        ? req.file.filename 
        : currentImage 
          ? currentImage 
          : null;

      await db.query(
        `UPDATE book SET 
          Title = ?, Author = ?, Genre = ?, book_condition = ?,
          description = ?, BookImage = ?
         WHERE BookID = ?`,
        [title, author, genre, condition, description, image, req.params.id]
      );

      // If a new image was uploaded and there was an old image, delete the old one
      if (req.file && books[0].BookImage) {
        const fs = require('fs');
        const path = require('path');
        const oldImagePath = path.join(__dirname, '../uploads/books', books[0].BookImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const [updated] = await db.query("SELECT * FROM book WHERE BookID = ?", [
        req.params.id,
      ]);

      res.json({
        success: true,
        message: "Book updated successfully",
        book: updated[0],
      });
    } catch (error) {
      console.error("Update book error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


// ------------------------------
// PUT /api/books/:id/status
// Update availability status (Protected)
// ------------------------------
router.put("/:id/status", auth, async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM book WHERE BookID = ?", [
      req.params.id,
    ]);

    if (books.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (books[0].OwnerID !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    let { isAvailable } = req.body;

    if (isAvailable === "Available") {
      isAvailable = "Reserved";
    } else {
      isAvailable = "Available";
    }
    // Update the book's availability status
    await db.query("UPDATE book SET book_condition = ? WHERE BookID = ?", [
      isAvailable,
      req.params.id,
    ]);

    res.json({
      success: true,
      message: `Book marked as ${
        isAvailable === "Available" ? "Available" : "Reserved"
      }`,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------
// DELETE /api/books/:id
// Delete a book (Protected)
// ------------------------------
router.delete("/:id", auth, async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM book WHERE BookID = ?", [
      req.params.id,
    ]);

    if (books.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (books[0].OwnerID !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await db.query("DELETE FROM book WHERE BookID = ?", [req.params.id]);

    res.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------
// GET /api/books/user/me
// Get all books by current user (Protected)
// ------------------------------
router.get("/user/me", auth, async (req, res) => {
  try {
    const [books] = await db.query(
      "SELECT * FROM book WHERE OwnerID = ? ORDER BY CreatedAt DESC",
      [req.userId]
    );

    res.json({ success: true, count: books.length, books });
  } catch (error) {
    console.error("User books error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get('/review/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const [rows] = await db.execute(
      `SELECT ReviewID, ReviewerID, reviewer_name, Rating, ReviewText, ReviewDate 
       FROM review WHERE BookID = ? ORDER BY ReviewDate DESC`,
      [bookId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// POST /api/books/review
router.post('/review', async (req, res) => {

  const { BookID, Rating, ReviewText, ReviewerID, ReviewerName } = req.body;

  // Basic validation
  if (!BookID || !Rating || !ReviewText || !ReviewerID || !ReviewerName) {
    return res.status(400).json({ message: 'All fields are required' });
  } 

  try {
    const [result] = await db.execute(
      `INSERT INTO review (BookID, Rating, ReviewText, ReviewerID,reviewer_name) VALUES (?, ?, ?, ?,?)`,
      [BookID, Rating, ReviewText, ReviewerID,ReviewerName]
    );

    // Return the newly created review ID with success
    res.status(201).json({ 
      ReviewID: result.insertId,
      BookID,
      Rating,
      ReviewText,
      ReviewerName,
      ReviewerID,
    });
  } catch (error) {
    console.error('Error inserting review:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

export default router;
