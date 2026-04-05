import express from "express";
import { createContact, getContacts, deleteContact } from "../controllers/contactController.js";
import VerifyToken from "../middleware/auth.js";
import authorizeRole from "../middleware/role.js";
import { contactValidationRules, validate } from "../validators/contactValidator.js";

const router = express.Router();

router.post("/", contactValidationRules(), validate, createContact);
router.get("/", VerifyToken, authorizeRole("admin"), getContacts);
router.delete("/:id", VerifyToken, authorizeRole("admin"), deleteContact);

export default router;