import express from "express";
import { getPaymentData, savePayment } from "../controllers/paymentController.js";
import VerifyToken from "../middleware/auth.js";

const router = express.Router();

// Frontend calls this to get form data → posts to ccavServer
router.get("/initiate-data", VerifyToken, getPaymentData);

// ccavServer calls this after successful payment to save record
router.post("/save", savePayment);

export default router;