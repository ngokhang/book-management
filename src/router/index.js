import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { utils } from "../utils/index.js";
import { schemas } from "../validator_schema/index.js";
import BookRouter from "./book.js";
import CategoryRouter from "./categories.js";
import OrderRouter from "./order.js";
import UserRouter from "./user.js";

export const router = express.Router();

// Auth routers
router.post(
  "/register",
  validateData(schemas.user.create),
  utils.asyncHandler(AuthController.register),
);
router.post("/login", AuthController.login);
router.put(
  "/change-password",
  [AuthenticatedMiddleware(), validateData(schemas.auth.changePassword)],
  utils.asyncHandler(AuthController.changePassword),
);

// Token routers
router.post("/refresh-token", AuthController.refreshToken);

router.use("/user", UserRouter);
router.use("/category", CategoryRouter);
router.use("/book", BookRouter);
router.use("/order", OrderRouter);
