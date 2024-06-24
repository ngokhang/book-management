import "dotenv/config";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import { response } from "../helpers/response.js";
import { BookServices } from "../services/BookServices.js";

export const BookController = {
  getAll: async (req, res, next) => {
    const { page, limit } = req.query;
    let role = null;

    if (req.header("Authorization")) {
      const { role: userRole } = getUserDataFromToken(req);
      role = userRole;
    }

    return response(
      res,
      200,
      "Get all books",
      await BookServices.getAll({ page, limit, role }),
    );
  },

  get: async (req, res, next) => {
    const { _id: bookId } = req.params;
    let role = null;

    if (req.header("Authorization")) {
      const { role: userRole } = getUserDataFromToken(req);
      role = userRole;
    }

    return response(
      res,
      200,
      "Get A Book",
      await BookServices.get({ bookId, role }),
    );
  },

  create: async (req, res) => {
    const bookData = {
      ...req.body,
      thumbnail:
        process.env.DEVELOP_MODE === "false"
          ? process.env.DOMAIN_DEV + "/src/uploads/default.png"
          : process.env.DOMAIN_PRODUCT + "/src/uploads/default.png",
    };
    const files = req.files;

    return res.status(201).json(await BookServices.create({ bookData, files }));
  },

  update: async (req, res, next) => {
    const bookData = { ...req.body };
    const bookId = req.params._id;

    return res
      .status(201)
      .json(await BookServices.update({ bookData, bookId }));
  },

  delete: async (req, res, next) => {
    const { arrayId } = req.body;
    return res.status(200).json(await BookServices.delete(arrayId));
  },

  hide: async (req, res, next) => {
    const { arrayId } = req.body;
    return res.status(200).json(await BookServices.hide(arrayId));
  },
};
