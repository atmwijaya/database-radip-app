import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import {errorHandler} from "./middleware/errorHandler.js";
import databaseRouter from "./routes/database.routes.js";
import activityRouter from "./routes/activity.routes.js";
import authRouter from "./routes/auth.routes.js";


dotenv.config();

const app = express();

await connectDB();

app.use(cors({

}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/db', databaseRouter);
app.use('/api/activities', activityRouter);
app.use('/api/auth', authRouter);

// Error handler
app.use(errorHandler);

// Unhandled error middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

export default app;