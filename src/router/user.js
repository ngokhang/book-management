import express from "express";
import { UserController } from "../controllers/UserController.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { utils } from "../utils/index.js";
import { schemas } from "../validator_schema/index.js";

const UserRouter = express.Router();

// User routers
UserRouter.route("/").get(
  [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
  UserController.getAll,
);
UserRouter.route("/:id")
  .get([AuthenticatedMiddleware()], utils.asyncHandler(UserController.get))
  .put(
    [AuthenticatedMiddleware(), validateData(schemas.user.update)],
    utils.asyncHandler(UserController.update),
  )
  .delete(
    [CheckIsAdminMiddleware()],
    utils.asyncHandler(UserController.delete),
  );

UserRouter.route("/:id/orders").get(
  [AuthenticatedMiddleware(), validateData(schemas.user.getOrders)],
  UserController.getOrders,
);

export default UserRouter;
