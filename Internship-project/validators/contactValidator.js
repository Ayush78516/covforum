import { body, validationResult } from "express-validator";

export const contactValidationRules = () => [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 characters long"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
    });
  }
  next();
};