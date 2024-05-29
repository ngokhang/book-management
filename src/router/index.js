import express from "express";
import { UserController } from "../controllers/UserController.js";
import validateData from "../middlewares/ValidateData.js";
import { createNewUserSchema } from "../validator_schema/index.js";
import { AuthController } from "../controllers/AuthController.js";

export const router = express.Router();
// User routers
router.route("/user").get(UserController.index);

// Auth routers
router.post(
  "/register",
  validateData(createNewUserSchema),
  AuthController.register
);
router.post("/login", AuthController.login);
