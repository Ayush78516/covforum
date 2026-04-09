import express from "express";
import VerifyToken from "../middleware/auth.js";
import { getProfile, saveAddress, saveEducation, saveExperience, saveMemberDetails, savePersonal } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", VerifyToken, getProfile);
router.put("/personal", VerifyToken, savePersonal);
router.put("/address", VerifyToken, saveAddress);
router.put("/member-details", VerifyToken, saveMemberDetails);
router.put("/education", VerifyToken, saveEducation);
router.put("/experience", VerifyToken, saveExperience);

export default router;