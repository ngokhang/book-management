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

    return await UserServices.update({ _id: id }, req.body)
      .then((result) => response(res, 200, "Update user", result))
      .catch((err) => next(err));
  },
  delete: async (req, res, next) => {
    const { id } = req.params;
    return await UserServices.delete({ _id: id })
      .then((result) => {
        return res.json({
          message: "Delete user",
          data: result,
        });
      })
      .catch((err) => next(err));
  },
  get: async (req, res, next) => {
    const { id } = req.params;
    const user = await UserServices.getUserByCondition({ _id: id });
    if (!user) return next(new Error("User not found"));
    return res.json({
      message: "Get user",
      data: user,
    });
  },
};
