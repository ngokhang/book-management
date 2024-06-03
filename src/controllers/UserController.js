import { response } from "../helpers/response.js";
import { UserServices } from "../services/UserServices.js";

export const UserController = {
  getAll: async (req, res) => {
    const users = await UserServices.getAllUser();
    return res.json({
      message: "Get all user",
      data: users,
    });
  },
  update: async (req, res, next) => {
    const { id } = req.params;

    return resposne(
      res,
      200,
      "Update user",
      await UserServices.update({ _id: id }, req.body),
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
    if (!user) return next(new Error("User not found"));

    return response(res, 200, "Get user", user);
  },
};
