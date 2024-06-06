import { StatusCodes } from "http-status-codes";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Book } from "../model/Book.js";
import { Categories } from "../model/Categories.js";

export const BookServices = {
  getAll: async ({ page, limit, role }) => {
    if (page < 0 || limit < 0) {
      page = 1;
      page = 10;
    }

    const queryCondition = {};

    // for user or guest (!role === null)
    if (role === "user" || !role) {
      queryCondition.isPublished = true;
    }

    return await Book.paginate(queryCondition, {
      page: page || 1,
      limit: limit || 10,
    });
  },

  get: async ({ bookId, role }) => {
    const queryCondition = { _id: bookId };
    if (role !== "admin") {
      queryCondition.isPublished = true;
    }

    const book = await Book.findOne(queryCondition);
    if (!book) {
      throw new ApiErrorHandler(404, "Book not found");
    }

    return book;
  },

  create: async ({ bookData }) => {
    try {
      const bookExist = await Book.findOne({ name: bookData.name }).lean();

      // // Check if book already exists
      if (bookExist)
        throw new ApiErrorHandler(StatusCodes.CONFLICT, "Book already exists");
      // Check if categories does not exist
      if (bookData.categories) {
        // Check if categories does not exist
        const validCategoriesId = await Categories.find({
          _id: { $in: bookData.categories },
        }).lean();

        if (validCategoriesId.length !== bookData.categories.length)
          throw new ApiErrorHandler(
            StatusCodes.NOT_FOUND,
            "Some of categories not found",
          );
      }

      const newBook = await Book.create(bookData);

      return newBook;
    } catch (error) {
      console.log("BookServices:::create:::error ", error);
      throw new ApiErrorHandler(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  },

  update: async ({ bookData, bookId }) => {
    try {
      // Check if categories does not exist
      if (bookData.categories) {
        // Check if categories does not exist
        const validCategoriesId = await Categories.find({
          _id: { $in: bookData.categories },
        }).lean();

        if (validCategoriesId.length !== bookData.categories.length)
          throw new ApiErrorHandler(
            StatusCodes.NOT_FOUND,
            "Some of categories not found",
          );
      }
      const nameExisted = await Book.findOne({
        _id: { $ne: bookId },
        name: bookData.name,
      });
      if (nameExisted)
        throw new ApiErrorHandler(StatusCodes.CONFLICT, "Book name is existed");

      const book = await Book.findOneAndUpdate(
        {
          _id: bookId,
        },
        bookData,
        { new: true },
      );

      if (!book)
        throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");

      return book;
    } catch (error) {
      throw error;
    }
  },

  delete: async (arrayId) => {
    try {
      const bookExisting = await Book.find({ _id: { $in: arrayId } }).lean();

      if (bookExisting.length !== arrayId.length)
        throw new ApiErrorHandler(
          StatusCodes.NOT_FOUND,
          "Some of books not found",
        );

      const response = await Book.deleteMany({ _id: { $in: arrayId } });
      if (response.deletedCount === 0)
        throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Books not found");

      return response;
    } catch (error) {
      throw error;
    }
  },

  hide: async (arrayId) => {
    try {
      const bookExisting = await Book.find({ _id: { $in: arrayId } }).lean();

      if (bookExisting.length !== arrayId.length)
        throw new ApiErrorHandler(
          StatusCodes.NOT_FOUND,
          "Some of books not found",
        );

      const response = await Book.updateMany(
        { _id: { $in: arrayId } },
        { isPublished: false },
      );

      return response;
    } catch (error) {
      throw error;
    }
  },
};
