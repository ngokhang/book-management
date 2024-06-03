import { StatusCodes } from "http-status-codes";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Categories } from "../model/Categories.js";

export const CategoryServices = {
  getAll: async (data) => {
    return Categories.paginate(
      { name: { $regex: data.name || "", $options: "i" } },
      { page: data._page, limit: data._limit },
      function (err, result) {
        if (err) {
          throw err;
        }
        return result;
      },
    );
  },
  get: async (data) => {
    const categories = await Categories.findOne({ _id: data._id });

    if (!categories)
      throw new ApiErrorHandler(StatusCodes.NOT_FOUND, "Category not found");

    return categories;
  },
  create: async (data) => {
    const { categories } = data;

    return await Categories.collection
      .insertMany(categories)
      .then((result) => result)
      .catch((err) => {
        throw err;
      });
  },
  update: async (data) => {
    return await Categories.findOneAndUpdate(
      { _id: data._id },
      { ...data },
      { new: true },
    )
      .then((result) => {
        if (!result) {
          throw new ApiErrorHandler(400, "Category not found");
        }

        return result;
      })
      .catch((err) => {
        throw err;
      });
  },
  delete: async (data) => {
    return await Categories.findOneAndDelete({ _id: data._id })
      .then((result) => {
        if (!result) {
          throw new ApiErrorHandler(400, "Category not found");
        }
        return result;
      })
      .catch((err) => {
        throw err;
      });
  },
  deleteMany: async (data) => {
    return await Categories.deleteMany({
      _id: { $in: data.categories_selected },
    })
      .then((result) => {
        if (result.deletedCount === 0) {
          throw new ApiErrorHandler(400, "Categories not found");
        }
        return result;
      })
      .catch((err) => {
        throw err;
      });
  },
  deleteAll: async () => {
    try {
      const response = await Categories.deleteMany();

      if (!response) {
        throw new ApiErrorHandler(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Delete all categories failed",
        );
      }
      if (response.deletedCount === 0) {
        throw new ApiErrorHandler(
          StatusCodes.NOT_FOUND,
          "Categories not found",
        );
      }

      return response;
    } catch (err) {
      throw err;
    }
  },
};
