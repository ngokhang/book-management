import express from "express";
import { BookController } from "../controllers/BookController.js";
import SearchController from "../controllers/SearchController.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { utils } from "../utils/index.js";
import { schemas } from "../validator_schema/index.js";

const BookRouter = express.Router();

// Book routers

/**
 * api/book: GET - Get all books
 * api/book: POST - Create a book
 */
BookRouter.route("/")
  .get(utils.asyncHandler(BookController.getAll))
  .post(
    [CheckIsAdminMiddleware(), validateData(schemas.createBookSchema)],
    utils.asyncHandler(BookController.create),
  )
  .delete(
    [CheckIsAdminMiddleware(), validateData(schemas.deleteBookSchema)],
    utils.asyncHandler(BookController.delete),
  );

BookRouter.route("/hide").patch(
  [CheckIsAdminMiddleware(), validateData(schemas.deleteBookSchema)],
  utils.asyncHandler(BookController.hide),
);

/**
 * api/book/search: GET - Search book
 */
BookRouter.route("/search").get(
  utils.asyncHandler(SearchController.searchBook),
);

/**
 * /api/book/:_id: GET - Get one book
 * /api/book/:_id: PATCH - Update one book
 */
BookRouter.route("/:_id")
  .get(utils.asyncHandler(BookController.get))
  .patch(
    [CheckIsAdminMiddleware(), validateData(schemas.updateBookSchema)],
    utils.asyncHandler(BookController.update),
  );

export default BookRouter;
