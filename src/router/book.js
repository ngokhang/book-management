import express from "express";
import multer from "multer";
import { BookController } from "../controllers/BookController.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import { utils } from "../utils/index.js";

const BookRouter = express.Router();

// Book routers
BookRouter.route("/")
  .get(BookController.getAll)
  .post(
    [
      CheckIsAdminMiddleware(),
      multer().fields([{ name: "thumbnail", maxCount: 1 }]),
    ],
    utils.asyncHandler(BookController.create),
  )
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(BookController.deleteAll),
  );

BookRouter.route("/:_id")
  .get(utils.asyncHandler(BookController.get))
  .patch(
    [
      CheckIsAdminMiddleware(),
      multer().fields([{ name: "thumbnail", maxCount: 1 }]),
    ],
    utils.asyncHandler(BookController.update),
  )
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(BookController.deleteOne),
  );

export default BookRouter;
