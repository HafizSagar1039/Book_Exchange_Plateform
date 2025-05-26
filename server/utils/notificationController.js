import db from "../config/db.js"
// Send notification
export async function sendNotification (userId, message) {
  const [result] = await db.execute(
    "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
    [userId, message]
  );
  return result;
};

// Get notifications
export async function getNotifications (req, res) {
  console.log(req.userId);
  const userId = req.user.id; // assuming you're using auth middleware
  const [rows] = await db.execute(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  res.json(rows);
};
