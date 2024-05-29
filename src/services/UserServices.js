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
};
