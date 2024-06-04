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
    [AuthenticatedMiddleware(), validateData(schemas.updateUserSchema)],
    utils.asyncHandler(UserController.update),
  )
  .delete(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    utils.asyncHandler(UserController.delete),
  );

export default UserRouter;
