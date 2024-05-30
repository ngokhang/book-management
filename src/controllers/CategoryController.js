import { response } from "../helpers/response.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { CategoryServices } from "../services/CategoryServices.js";

export const CategoryController = {
  getAll: async (req, res, next) => {
    return await CategoryServices.getAll(req.query)
      .then((result) => response(res, 200, "Get All Categories", result))
      .catch((err) => next(err));
  },
  get: async (req, res, next) => {
    return await CategoryServices.get(req.params)
      .then((result) => response(res, 200, "Get A Category", result))
      .catch((err) => next(err));
  },
  create: async (req, res, next) => {
    const { categories } = req.body;

    return await CategoryServices.create({ categories })
      .then((result) => {
        response(res, 200, "Category created", result);
      })
      .catch((err) => {
        const {
          code,
          op: { name: fieldNameExisted },
        } = err.writeErrors[0].err;

        if (code === 11000) {
          next(new Error(fieldNameExisted + " already exists"));
        }
        next(new Error("Failed to create category"));
      });
  },
  update: async (req, res, next) => {
    const data = req.body;
    const { _id } = req.params;

    return await CategoryServices.update({ _id, ...data })
      .then((result) => response(res, 200, "Category updated", result))
      .catch((err) => next(err));
  },
  delete: async (req, res, next) => {
    const data = req.body;
    const { _id } = req.params;

    return await CategoryServices.delete({ _id, ...data })
      .then((result) => response(res, 200, "Category deleted", result))
      .catch((err) => next(err));
  },
  deleteMany: async (req, res, next) => {
    const { categories_selected } = req.body;

    return await CategoryServices.deleteMany({ categories_selected })
      .then((result) => response(res, 200, "Categories deleted", result))
      .catch((err) => next(err));
  },

  deleteAll: async (req, res, next) => {
    return await CategoryServices.deleteAll()
      .then((result) => {
        if (result.deletedCount === 0) {
          return next(new ApiErrorHandler(400, "Categories not found"));
        }
        return response(res, 200, "All Categories deleted", result);
      })
      .catch((err) => next(err));
  },
};
