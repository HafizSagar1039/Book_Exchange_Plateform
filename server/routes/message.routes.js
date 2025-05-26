import express from 'express';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import db from '../config/db.js';

const router = express.Router();

// GET messages for a specific exchange
router.get('/:exchangeId', auth, async (req, res) => {
  try {
    const exchangeId = req.params.exchangeId;

    // Fetch exchange details from bookexchange table
    const [exchanges] = await db.query(
      `SELECT * FROM bookexchange WHERE id = ?`,
      [exchangeId]
    );

    if (exchanges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found',
      });
    }

    const exchange = exchanges[0];

    // Check if the user is either the Owner or Seeker of this exchange
    if (exchange.OwnerID !== req.userId && exchange.SeekerID !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages',
      });
    }

    // Fetch messages related to this exchange based on BookID and participants
    const [messages] = await db.query(
      `SELECT MessageID, SenderID, ReceiverID, BookID, MessageContent, Timestamp
       FROM message
       WHERE BookID = ? AND 
         (SenderID = ? OR ReceiverID = ?) AND
         (SenderID = ? OR ReceiverID = ?)
       ORDER BY Timestamp ASC`,
      [
        exchange.BookID,
        exchange.OwnerID,
        exchange.OwnerID,
        exchange.SeekerID,
        exchange.SeekerID,
      ]
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// POST send a new message
router.post(
  '/',
  [
    auth,
    body('exchange_id').isNumeric().withMessage('Exchange ID is required'),
    body('message').notEmpty().withMessage('Message content is required'),
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { exchange_id, message } = req.body;

    try {
      // Get exchange info from bookexchange table
      const [exchanges] = await db.query(
        `SELECT * FROM bookexchange WHERE id = ?`,
        [exchange_id]
      );

      if (exchanges.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exchange not found',
        });
      }

      const exchange = exchanges[0];

      // Check user authorization (must be Owner or Seeker)
      if (exchange.OwnerID !== req.userId && exchange.SeekerID !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to send messages in this exchange',
        });
      }

      // Determine the receiver ID (the other participant)
      const receiverId = exchange.OwnerID === req.userId ? exchange.SeekerID : exchange.OwnerID;

      // Insert message into messages table
      const [result] = await db.query(
        `INSERT INTO message (SenderID, ReceiverID, BookID, MessageContent, Timestamp)
         VALUES (?, ?, ?, ?, NOW())`,
        [req.userId, receiverId, exchange.BookID, message]
      );

      // Get the inserted message details
      const [messages] = await db.query(
        `SELECT MessageID, SenderID, ReceiverID, BookID, MessageContent, Timestamp
         FROM message WHERE MessageID = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        sentMessage: messages[0],
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

export default router;
