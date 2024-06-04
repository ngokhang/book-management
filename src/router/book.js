import express from "express";
import { BookController } from "../controllers/BookController.js";
import { utils } from "../utils/index.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";

const BookRouter = express.Router();

// Book routers
BookRouter.route("/")
  .get(BookController.getAll)
  .post(CheckIsAdminMiddleware(), utils.asyncHandler(BookController.create))
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(BookController.deleteAll),
  );

BookRouter.route("/:_id")
  .get(utils.asyncHandler(BookController.get))
  .patch(CheckIsAdminMiddleware(), utils.asyncHandler(BookController.update))
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(BookController.deleteOne),
  );

export default BookRouter;
