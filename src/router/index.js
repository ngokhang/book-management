import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserController } from "../controllers/UserController.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { schemas } from "../validator_schema/index.js";

export const router = express.Router();

// User routers
router
  .route("/user")
  .get(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    UserController.getAll
  );
router
  .route("/user/:id")
  .get([AuthenticatedMiddleware()], UserController.get)
  .put(
    [AuthenticatedMiddleware(), validateData(schemas.updateUserSchema)],
    UserController.update
  )
  .delete(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    UserController.delete
  );

// Auth routers
router.post(
  "/register",
  validateData(schemas.createNewUserSchema),
  AuthController.register
);
router.post("/login", AuthController.login);
router.put(
  "/change-password",
  [AuthenticatedMiddleware(), validateData(schemas.changePasswordSchema)],
  AuthController.changePassword
);

// Token routers
router.post("/refresh-token", AuthController.refreshToken);

//
