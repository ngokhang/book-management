import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import { response } from "../helpers/response.js";
import { OrderServices } from "../services/OrderServices.js";

export const OrderController = {
  getAll: async (req, res) => {
    const { page, limit } = req.query;
    const { role, _id: userId } = getUserDataFromToken(req);

    return response(
      res,
      200,
      "Get all orders",
      await OrderServices.getAll({ page, limit, role, userId }),
    );
  },
  getUserOrders: async (req, res) =>
    response(res, 200, "Get order", await OrderServices.getUserOrders(req)),
  create: async (req, res) => {
    const orderData = req.body;
    // const { _id: userId } = getUserDataFromToken(req);

    return response(
      res,
      201,
      "Create order",
      await OrderServices.create({ ...orderData }),
    );
  },
  update: async (req, res) => {
    const { orderId } = req.params;
    const updateData = req.body;

    return response(
      res,
      200,
      "Update order",
      await OrderServices.update({ orderId, updateData }),
    );
  },
  delete: async (req, res) => {
    const { orderIdList } = req.body;
    return response(
      res,
      200,
      "Delete orders",
      await OrderServices.delete({ orderIdList }),
    );
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
