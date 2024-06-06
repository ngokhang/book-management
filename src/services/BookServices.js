import fs from "fs";
import { StatusCodes } from "http-status-codes";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Author } from "../model/Author.js";
import { Book } from "../model/Book.js";
import { utils } from "../utils/index.js";
import { Categories } from "../model/Categories.js";

export const BookServices = {
  getAll: async (data) => {
    return await Book.paginate({}, { page: data._page, limit: data._limit });
  },

  get: async (data) => {
    const response = await Book.findById(data._id);

    if (!response)
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");

    return response;
  },

  create: async ({
    body: { name, author, categories, description, thumbnail },
    files,
  }) => {
    try {
      const data = {
        name,
        author,
        categories,
        description,
        thumbnail: thumbnail ? thumbnail[0].filename : "12",
      };
      const existedAuthor = await Author.findOne({ name: data.author }).lean();
      const existedCategories = await Categories.findOne({
        name: data.categories,
      }).lean();
      const existedBook = await Book.findOne({ name: data.name }).lean();

      if (!existedAuthor) {
        const newAuthor = await Author.create({ name: data.author });
        data.author = newAuthor._id;
      } else {
        data.author = existedAuthor._id;
      }

      if (!existedCategories) {
        const newCategories = await Categories.create({
          name: data.categories,
        });
        data.categories = newCategories._id;
      } else {
        data.categories = existedCategories._id;
      }

      if (existedBook) {
        throw new ApiErrorHandler(StatusCodes.CONFLICT, "Book existed");
      }

      utils.storageThumbnail(files, data);
      const newBook = await Book.create(data);

      if (!newBook) {
        throw new ApiErrorHandler(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Create book failed",
        );
      }

      return newBook;
    } catch (error) {
      throw error;
    }
  },

  update: async ({
    body: { name, author, categories, description, thumbnail },
    files,
    params: { _id },
  }) => {
    try {
      const data = {
        name,
        author,
        categories,
        description,
        thumbnail: thumbnail ? thumbnail[0].filename : "12",
      };
      const existedAuthor = await Author.findOne({ name: data.author }).lean();
      const existedCategories = await Categories.findOne({
        name: data.categories,
      }).lean();
      const existedBook = await Book.findOne({ _id }).lean();

      if (!existedAuthor) {
        const newAuthor = await Author.create({ name: data.author });
        data.author = newAuthor._id;
      } else {
        data.author = existedAuthor._id;
      }

      if (!existedCategories) {
        const newCategories = await Categories.create({
          name: data.categories,
        });
        data.categories = newCategories._id;
      } else {
        data.categories = existedCategories._id;
      }

      if (!existedBook) {
        throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");
      }

      const isNewThumbnail = utils.storageThumbnail(files, data);
      if (isNewThumbnail) {
        const oldThumbnail = existedBook.thumbnail;
        const path =
          process.cwd() + "/src/uploads/" + oldThumbnail.split("/").pop();
        fs.unlinkSync(path);
        const updatedBook = await Book.updateOne({ _id }, data, { new: true });
        if (!updatedBook) {
          throw new ApiErrorHandler(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Update book failed",
          );
        }

        return updatedBook;
      } else {
        delete data.thumbnail;
        const updatedBook = await Book.updateOne({ _id }, data, { new: true });

        if (!updatedBook) {
          throw new ApiErrorHandler(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Update book failed",
          );
        }

        return updatedBook;
      }
    } catch (error) {
      throw error;
    }
  },
  deleteOne: async (data) => {
    const response = await Book.findByIdAndDelete(data._id);
    if (!response) {
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");
    }

    return response;
  },

  deleteMany: async (data) => {
    const response = await Book.deleteMany({ _id: { $in: data.ids } });

    if (!response)
      throw new ApiErrorHandler(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Delete books failed",
      );

    if (response.deletedCount === 0)
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Books not found");

    return response;
  },

  deleteAll: async () => {
    const response = await Book.deleteMany({});

    if (!response)
      throw new ApiErrorHandler(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Delete all books failed",
      );

    if (response.deletedCount === 0)
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Books not found");

    return response;
  },
};
