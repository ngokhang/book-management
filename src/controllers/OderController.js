import { response } from "../helpers/response.js";
import { OrderServices } from "../services/OrderServices.js";

export const OrderController = {
  getAll: async (req, res) => {
    return response(
      res,
      200,
      "Get all orders",
      await OrderServices.getAll(req),
    );
  },
  getUserOrders: async (req, res) =>
    response(res, 200, "Get order", await OrderServices.getUserOrders(req)),
  create: async (req, res) => {
    return response(
      res,
      201,
      "Create order",
      await OrderServices.create(req.body),
    );
  },
  update: async (req, res) => {
    return response(res, 200, "Update order", await OrderServices.update(req));
  },

  getPopularOrderInMonth: async (req, res) => {
    return response(
      res,
      200,
      "Get orders of month",
      await OrderServices.getOrderInMonth(req),
    );
  },

  getMostBorrowed: async (req, res) => {
    return response(
      res,
      200,
      "Get most borrowed",
      await OrderServices.getMostBorrowedBook(req),
    );
  },
};
