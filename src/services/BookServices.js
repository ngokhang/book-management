import mongoose from "mongoose";
import { Book } from "../model/Book.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { StatusCodes } from "http-status-codes";

export const BookServices = {
  getAll: async (data) => {
    const aggregate = Book.aggregate([
      { $unwind: "$categories" },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "authors",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
    ]);

    return await Book.aggregatePaginate(aggregate, {
      page: data._page,
      limit: data._limit,
    })
      .then((result) => result)
      .catch((err) => {
        throw err;
      });
  },

  get: async (data) => {
    const aggregate = [
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(data._id),
        },
      },
      { $unwind: "$categories" },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "authors",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
    ];

    const response = await Book.aggregate(aggregate);

    if (!response.length)
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");

    return response[0];
  },

  create: async (data) => {
    const isExistedBook = await Book.findOne({ name: data.name });

    if (isExistedBook)
      throw new ApiErrorHandler(StatusCodes.CONFLICT, "Book existed");

    const newBook = await Book.create(data);

    if (!newBook)
      throw new ApiErrorHandler(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Create book failed",
      );

    return newBook;
  },

  update: async (data) =>
    await Book.findOneAndUpdate({ _id: data._id }, data, {
      new: true,
    })
      .then((response) => {
        if (!response)
          throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Book not found");

        return response;
      })
      .catch((err) => {
        throw err;
      }),

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
