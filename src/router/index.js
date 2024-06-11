import express from "express";
import multer from "multer";
import { AuthController } from "../controllers/AuthController.js";
import ForgotPasswordController from "../controllers/ForgotPasswordController.js";
import UploadFileController from "../controllers/UploadFileController.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { utils } from "../utils/index.js";
import { schemas } from "../validator_schema/index.js";
import AnalystRouter from "./analyst.js";
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
router.post(
  "/logout",
  [AuthenticatedMiddleware()],
  utils.asyncHandler(AuthController.logout),
);
router
  .route("/forgot-password")
  .post(utils.asyncHandler(ForgotPasswordController.sendRequestReset))
  .patch(utils.asyncHandler(ForgotPasswordController.setNewPassword));

router
  .route("/upload/book-thumbnail")
  .post(
    multer().single("thumbnail"),
    utils.asyncHandler(UploadFileController.uploadFileToDiskStorage),
  );

// Token routers
router.post("/refresh-token", AuthController.refreshToken);

router.use("/user", UserRouter);
router.use("/category", CategoryRouter);
router.use("/book", BookRouter);
router.use("/order", OrderRouter);
router.use("/analyst", AnalystRouter);
