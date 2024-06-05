import fs from "fs";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Book } from "../model/Book.js";

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
    const data = {
      name,
      author: JSON.parse(author),
      categories: JSON.parse(categories),
      description,
      thumbnail: thumbnail ? thumbnail[0].filename : "12",
    };
    const isExistedBook = await Book.findOne({ name: data.name });

    if (isExistedBook)
      throw new ApiErrorHandler(StatusCodes.CONFLICT, "Book existed");

    // Storage image to folder uploads
    if (files.thumbnail) {
      const image = files.thumbnail[0];
      const fileName = `${Date.now()}-${image.originalname}`;
      const path = process.cwd() + "/src/uploads/" + fileName;

      fs.writeFileSync(path, image.buffer);

      data.thumbnail = process.env.DEVELOP_MODE
        ? `${process.env.DOMAIN_DEV}/src/uploads/${fileName}`
        : `${process.env.DOMAIN_PROD}/src/uploads/${fileName}`;
    }

    const newBook = await Book.create(data);

    if (!newBook)
      throw new ApiErrorHandler(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Create book failed",
      );

    return newBook;
  },

  update: async ({
    body: { name, author, categories, description, thumbnail },
    files,
    params: { _id },
  }) => {
    const data = {
      name,
      author,
      categories,
      description,
      thumbnail,
    };

    //  Storage image to folder uploads
    if (files.thumbnail) {
      const image = files.thumbnail[0];
      const fileName = `${Date.now()}-${image.originalname}`;
      const path = process.cwd() + "/src/uploads/" + fileName;

      fs.writeFileSync(path, image.buffer);
      data.thumbnail = process.env.DEVELOP_MODE
        ? `${process.env.DOMAIN_DEV}/src/uploads/${fileName}`
        : `${process.env.DOMAIN_PROD}/src/uploads/${fileName}`;
    }

    const response = await Book.findOneAndUpdate(
      { _id: _id },
      {
        ...data,
        author: JSON.parse(data.author),
        categories: JSON.parse(data.categories),
      },
      {
        new: true,
      },
    );

    if (!response) {
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");
    }

    return response;
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
