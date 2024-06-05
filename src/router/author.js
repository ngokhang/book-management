import express from "express";
import AuthorController from "../controllers/AuthorController.js";
import { utils } from "../utils/index.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";

const AuthorRouter = express.Router();

AuthorRouter.route("/")
  .get(AuthorController.getAll)
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(AuthorController.delete),
  );

AuthorRouter.route("/delete-all").delete(
  CheckIsAdminMiddleware(),
  utils.asyncHandler(AuthorController.deleteAll),
);

AuthorRouter.route("/:id")
  .get(utils.asyncHandler(AuthorController.get))
  .patch(CheckIsAdminMiddleware(), utils.asyncHandler(AuthorController.update));

export default AuthorRouter;
