import { UserServices } from "../services/UserServices.js";

export const UserController = {
  index: async (req, res) => {
    const users = await UserServices.getAllUser();
    return res.json({
      message: "Get all user",
      data: users,
    });
  },
};
