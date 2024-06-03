import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserController } from "../controllers/UserController.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { schemas } from "../validator_schema/index.js";
import { CategoryController } from "../controllers/CategoryController.js";
import { BookController } from "../controllers/BookController.js";
import { utils } from "../utils/index.js";
import { OrderController } from "../controllers/OderController.js";

export const router = express.Router();

// User routers
router
  .route("/user")
  .get(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    UserController.getAll,
  );
router
  .route("/user/:id")
  .get([AuthenticatedMiddleware()], utils.asyncHandler(UserController.get))
  .put(
    [AuthenticatedMiddleware(), validateData(schemas.updateUserSchema)],
    utils.asyncHandler(UserController.update),
  )
  .delete(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    utils.asyncHandler(UserController.delete),
  );

// Auth routers
router.post(
  "/register",
  validateData(schemas.createNewUserSchema),
  utils.asyncHandler(AuthController.register),
);
router.post("/login", AuthController.login);
router.put(
  "/change-password",
  [AuthenticatedMiddleware(), validateData(schemas.changePasswordSchema)],
  utils.asyncHandler(AuthController.changePassword),
);

// Token routers
router.post("/refresh-token", AuthController.refreshToken);

// Category routers
/**
 * @swagger
 * /category: */
router
  .route("/category")
  .get(CategoryController.getAll)
  .post(
    [
      validateData(schemas.createCategorySchema),
      AuthenticatedMiddleware(),
      CheckIsAdminMiddleware(),
    ],
    utils.asyncHandler(CategoryController.create),
  )
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(CategoryController.deleteMany),
  );
router.delete(
  "/category/delete-all",
  [CheckIsAdminMiddleware()],
  utils.asyncHandler(CategoryController.deleteAll),
);
router
  .route("/category/:_id")
  .get(CategoryController.get)
  .patch(
    [CheckIsAdminMiddleware()],
    utils.asyncHandler(CategoryController.update),
  )
  .delete(
    [CheckIsAdminMiddleware()],
    utils.asyncHandler(CategoryController.delete),
  );

// Book routers
/**
 *
 */
router
  .route("/book")
  .get(BookController.getAll)
  .post(CheckIsAdminMiddleware(), utils.asyncHandler(BookController.create))
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(BookController.deleteAll),
  );

router
  .route("/book/:_id")
  .get(utils.asyncHandler(BookController.get))
  .patch(CheckIsAdminMiddleware(), utils.asyncHandler(BookController.update))
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(BookController.deleteOne),
  );

// router order for admin
router
  .route("/admin/order")
  .get(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    utils.asyncHandler(OrderController.getAll),
  )
  .post(
    [
      AuthenticatedMiddleware(),
      validateData(schemas.createOrderSchema),
      CheckIsAdminMiddleware(),
    ],
    utils.asyncHandler(OrderController.create),
  )
  .patch(
    [AuthenticatedMiddleware(), validateData(schemas.updateOrderSchema)],
    utils.asyncHandler(OrderController.update),
  );

// router order for user
router
  .route("/order")
  .get(AuthenticatedMiddleware(), utils.asyncHandler(OrderController.getAll))
  .post(
    [AuthenticatedMiddleware(), validateData(schemas.createOrderSchema)],
    utils.asyncHandler(OrderController.create),
  )
  .patch(
    [AuthenticatedMiddleware(), validateData(schemas.updateOrderSchema)],
    utils.asyncHandler(OrderController.update),
  );
