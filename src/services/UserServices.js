import { User } from "../model/UserSchema.js";
import bcrypt from "bcrypt";

export const UserServices = {
  getAllUser: async () => {
    return await User.find();
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
  getUserByCondition: async (params) => {
    return await User.findOne({ ...params })
      .exec()
      .then((res) => res)
      .catch((err) => err);
  },
  delete: async (params) => {
    const user = await User.findOne({ ...params });
    if (!user) throw new Error("User invalid");

    return await User.deleteOne({ ...params })
      .exec()
      .then((res) => res)
      .catch((err) => err);
  },
  update: async (params, data) => {
    const user = await User.findOne({ ...params });
    if (!user) throw new Error("User invalid");

    return await User.updateOne({ ...params }, { ...data })
      .exec()
      .then((res) => res)
      .catch((err) => err);
  },
};
