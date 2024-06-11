import { response } from "../helpers/response.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { UserServices } from "../services/UserServices.js";

export const UserController = {
  getAll: async (req, res) => {
    const users = await UserServices.getAllUser(req);
    return res.json({
      message: "Get all user",
      data: users,
    });
  },
  update: async (req, res, next) => {
    const { params, body } = req;
    return response(
      res,
      200,
      "Update user",
      await UserServices.update({ params, body }),
    );
  },
  delete: async (req, res, next) => {
    const { id } = req.params;
    return response(
      res,
      200,
      "Delete user",
      await UserServices.delete({ _id: id }),
    );
  },
  get: async (req, res, next) => {
    const { id } = req.params;
    const user = await UserServices.getUserByCondition({ _id: id });
    if (!user) return next(new ApiErrorHandler(404, "User not found"));

    return response(res, 200, "Get user", user);
  },
  getOrders: async (req, res) => {
    const { month, page, limit } = req.query;
    const { id: userId } = req.params;

    return response(
      res,
      200,
      "Get user orders",
      await UserServices.getUserOrders({ month, userId, page, limit }),
    );
  },
};
