import { UserServices } from "../services/UserServices.js";

export const UserController = {
  getAll: async (req, res) => {
    const users = await UserServices.getAllUser();
    return res.json({
      message: "Get all user",
      data: users,
    });
  },
  update: async (req, res) => {},
  delete: async (req, res) => {},
  get: async (req, res) => {},
};
