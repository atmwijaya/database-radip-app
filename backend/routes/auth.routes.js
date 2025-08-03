import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({ 
    valid: true, 
    user: req.user,
    expiresIn: req.user.exp // Return expiration time if needed
  });
});
router.post("/signup", register);
router.post("/login", login);

// Protected route example



export default router;