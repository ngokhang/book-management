import { response } from "../helpers/response.js";
import AuthorServices from "../services/AuthorServices.js";

const AuthController = {
  getAll: async (req, res) => {
    return response(
      res,
      200,
      "Get all authors",
      await AuthorServices.getAll(req),
    );
  },
  get: async (req, res) => {
    return response(res, 200, "Get author", await AuthorServices.get(req));
  },
  create: async (req, res) => {
    return response(
      res,
      201,
      "Create author",
      await AuthorServices.create(req),
    );
  },
  update: async (req, res) => {
    return response(
      res,
      200,
      "Update author",
      await AuthorServices.update(req),
    );
  },
  delete: async (req, res) => {
    return response(
      res,
      204,
      "Delete author",
      await AuthorServices.delete(req),
    );
  },
  deleteAll: async (req, res) => {
    return response(
      res,
      204,
      "Delete all authors",
      await AuthorServices.deleteAll(req),
    );
  },
};

export default AuthController;
