import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { verifyThisToken } from '../utils/auth.js';

const router = express.Router();

// Auth routes
router.get("/verify", verifyThisToken, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});
router.post("/signup", register);
router.post("/login", login);

// Protected route example



export default router;