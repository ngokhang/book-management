import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { User } from "../model/UserSchema.js";
import bcrypt from "bcrypt";

export const UserServices = {
  getAllUser: async ({ query: { _page, _limit } }) => {
    return await User.paginate({}, { page: _page, limit: _limit });
  },
  createUser: async (data) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error("User with this email already exists");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    return await User.create({ ...data, password: hashedPassword })
      .then((res) => res)
      .catch((err) => err);
  },
  getUserByCondition: async ({ _id }) => {
    try {
      const userExisting = await User.findOne({ _id });

      if (!userExisting) throw new ApiErrorHandler(404, "User not found");

      return userExisting;
    } catch (error) {
      throw error;
    }
  },
  delete: async (params) => {
    const user = await User.findOne({ ...params });
    if (!user) throw new Error("User invalid");

    return await User.deleteOne({ ...params })
      .exec()
      .then((res) => res)
      .catch((err) => err);
  },
  update: async ({ params: { _id }, body }) => {
    const user = await User.findOne({ _id });
    if (!user) throw new Error("User invalid");

    return await User.updateOne({ _id }, { body })
      .exec()
      .then((res) => res)
      .catch((err) => {
        throw err;
      });
  },
};
