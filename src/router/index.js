import express from "express";
import multer from "multer";
import path from "path";
import { AuthController } from "../controllers/AuthController.js";
import ForgotPasswordController from "../controllers/ForgotPasswordController.js";
import UploadFileController from "../controllers/UploadFileController.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { utils } from "../utils/index.js";
import { schemas } from "../validator_schema/index.js";
import AnalystRouter from "./analyst.js";
import BookRouter from "./book.js";
import CategoryRouter from "./categories.js";
import OrderRouter from "./order.js";
import TokenRouter from "./token.js";
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

router.route("/upload/book-thumbnail").post(
  [
    CheckIsAdminMiddleware(),
    multer({
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
      fileFilter: function (req, file, cb) {
        const extensionAllow = [".png", ".jpg", ".jpeg"];
        if (!extensionAllow.includes(path.extname(file.originalname)))
          cb(
            new ApiErrorHandler(
              422,
              "Invalid image, only allowed : .png, .jpg, .jpeg",
            ),
            false,
          );
        else {
          cb(null, true);
        }
      },
    }).single("thumbnail"),
  ],
  utils.asyncHandler(UploadFileController.uploadToGoogleDrive),
);

// Token routers
router.use("/token", TokenRouter);

router.use("/user", UserRouter);
router.use("/category", CategoryRouter);
router.use("/book", BookRouter);
router.use("/order", OrderRouter);
router.use("/analyst", AnalystRouter);
