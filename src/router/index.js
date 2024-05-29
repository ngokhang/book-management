import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserController } from "../controllers/UserController.js";
import validateData from "../middlewares/ValidateData.js";
import { schemas } from "../validator_schema/index.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import CheckExpiredToken from "../middlewares/CheckExpiredToken.js";

export const router = express.Router();

// User routers
router
  .route("/user")
  .get([CheckExpiredToken(), CheckIsAdminMiddleware()], UserController.getAll);

// Auth routers
router.post(
  "/register",
  validateData(schemas.createNewUserSchema),
  AuthController.register
);
router.post("/login", AuthController.login);

// Token routers
router.post("/refresh-token", AuthController.refreshToken);

//
