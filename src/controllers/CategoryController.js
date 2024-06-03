import { response } from "../helpers/response.js";
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
    return response(res, 200, "Category created", { categories });
  },
  update: async (req, res, next) => {
    const data = req.body;
    const { _id } = req.params;

    return response(
      res,
      200,
      "Category updated",
      await CategoryServices.update({ _id, ...data }),
    );
  },
  delete: async (req, res, next) => {
    const data = req.body;
    const { _id } = req.params;

    return response(
      res,
      200,
      "Category deleted",
      await CategoryServices.delete({ _id, ...data }),
    );
  },
  deleteMany: async (req, res, next) => {
    const { categories_selected } = req.body;

    return response(
      res,
      200,
      "Categories deleted",
      await CategoryServices.deleteMany({ categories_selected }),
    );
  },

  deleteAll: async (req, res, next) => {
    return response(
      res,
      200,
      "All Categories deleted",
      await CategoryServices.deleteAll(),
    );
  },
};
