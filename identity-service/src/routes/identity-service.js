import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../controllers/identity-controller.js";
import { validateRegistration, validateLogin } from "../utils/validation.js";

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
export default router;
