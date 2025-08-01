import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

// Auth routes
router.post("/signup", register);
router.post("/login", login);

// Protected route example



export default router;