import express from 'express';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import db from '../config/db.js';

const router = express.Router();

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, first_name, last_name, email,mobile,address,picture, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put(
  '/me',
  [
    auth,
    body('first_name').notEmpty().withMessage('First Name is required'),
    body('last_name').notEmpty().withMessage(' Last Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { first_name, last_name,address } = req.body;

    try {
      const data=await db.query(
        'UPDATE users SET first_name = ?, last_name = ?,address = ? WHERE id = ?',
        [first_name, last_name,address, req.userId]
      );

      const [users] = await db.query(
        'SELECT id, first_name, last_name, email, address,picture, created_at FROM users WHERE id = ?',
        [req.userId]
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: users[0]
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, location, bio, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [books] = await db.query(
      'SELECT * FROM books WHERE user_id = ? AND is_available = 1',
      [req.params.id]
    );

    res.json({
      success: true,
      user: {
        ...users[0],
        books
      }
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST api/users/wishlist
// @desc    Add a book to wishlist
// @access  Private
router.post(
  '/wishlist',
  [
    auth,
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('genre').notEmpty().trim().withMessage('Genre is required'),
    body('author').notEmpty().trim().withMessage('Author is required'), // Made author required
    body('book_id').optional().isInt().withMessage('Book ID must be an integer')
  ],
  async (req, res) => {
    
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { title, genre, author, book_id } = req.body;
    const userId = req.userId;

    try {
      // Check if book already exists in user's wishlist
      const [existing] = await db.query(
        `SELECT * FROM wishlist 
        WHERE User_ID = ? AND BookTitle = ? AND Author = ?`,
        [userId, title, author]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This book is already in your wishlist',
          existingItem: existing[0] // Return existing item for reference
        });
      }

      // Add to wishlist with created_at timestamp
      const [result] = await db.query(
        `INSERT INTO wishlist (
          User_ID, Book_ID, BookTitle, Author, Genre, CreatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, book_id, title, author, genre]
      );

      // Get the newly added item with user details
      const [wishlistItem] = await db.query(
        `SELECT w.*, u.username, u.email 
        FROM wishlist w
        JOIN users u ON w.User_ID = u.id
        WHERE w.WishListID = ?`,
        [result.insertId]
      );

      return res.status(201).json({
        success: true,
        message: 'Added to wishlist successfully',
        data: {
          ...wishlistItem[0],
          addedBy: {
            userId,
            username: wishlistItem[0].username,
            email: wishlistItem[0].email
          }
        }
      });

    } catch (error) {
      console.error('Wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add to wishlist',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

// @route   GET api/users/wishlist/me
// @desc    Get current user's wishlist
// @access  Private
router.get('/wishlist/me', auth, async (req, res) => {

  try {
    const [wishlist] = await db.query(
      'SELECT * FROM wishlist WHERE User_ID = ? ORDER BY CreatedAt DESC',
      [req.userId]
    );

    res.json({
      success: true,
      count: wishlist.length,
      wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE api/users/wishlist/:id
// @desc    Remove item from wishlist
// @access  Private
router.delete('/wishlist/:id', auth, async (req, res) => {

  try {
    const [wishlistItems] = await db.query(
      'SELECT * FROM wishlist WHERE WishListID = ?',
      [req.params.id]
    );

    if (wishlistItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    if (wishlistItems[0].User_ID !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this item'
      });
    }

    await db.query('DELETE FROM wishlist WHERE WishListID = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
