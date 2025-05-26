import express from "express"
const router = express.Router();
import { getNotifications } from "../utils/notificationController.js";
import auth from "../middleware/auth.js";

router.get("/", auth, getNotifications);

export default router;
