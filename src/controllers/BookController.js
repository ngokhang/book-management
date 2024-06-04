import { BOOK } from "../constants/index.js";
import message from "../helpers/message.js";
import { response } from "../helpers/response.js";
import { BookServices } from "../services/BookServices.js";

export const BookController = {
  getAll: async (req, res, next) => {
    return await BookServices.getAll(req)
      .then((result) => response(res, 200, message("Get all", BOOK), result))
      .catch((err) => next(err));
  },

  get: async (req, res, next) => {
    return res.status(200).json(await BookServices.get(req.params));
  },
  create: async (req, res) => {
    return res.status(201).json(await BookServices.create(req));
  },
  update: async (req, res, next) => {
    const data = { ...req.body, _id: req.params._id };
    return res.status(201).json(await BookServices.update(data));
  },
  deleteOne: async (req, res) => {
    return res.status(201).json(await BookServices.deleteOne(req.params));
  },
  deleteMany: async (req, res, next) => {
    return res.status(200).json(await BookServices.deleteOne(req.params));
  },
  deleteAll: async (req, res, next) => {
    return res.status(200).json(await BookServices.deleteAll());
  },
};
