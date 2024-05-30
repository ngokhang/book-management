import bcrypt from "bcrypt";
import "dotenv/config";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { User } from "../model/UserSchema.js";
import { JwtServices } from "./JwtServices.js";
import { utils } from "../utils/index.js";

export const AuthServices = {
  login: async (data) => {
    const { email, password } = data;
    const userExisting = await User.findOne({
      email,
    });

    // Check if user is not found
    if (!userExisting) throw new ApiErrorHandler(401, "User not found");

    const { _id, firstName, lastName, role } = userExisting;

    // Check validity of password
    const isPasswordMatch = await bcrypt.compare(
      password,
      userExisting.password
    );

    // Check if password is incorrect
    if (!isPasswordMatch)
      throw new ApiErrorHandler(401, "Password is incorrect");

    // Generate access token and refresh token
    const accessToken = JwtServices.sign(
      { _id, firstName, lastName, role, email },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE
    );
    const refreshToken = JwtServices.sign(
      { _id, firstName, lastName, role, email },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_LIFE
    );

    return {
      userExisting, // Return user data
      accessToken,
      refreshToken,
    };
  },

  register: async (data) => {
    const { email, password } = data;
    const existingUser = await User.findOne({ email });

    if (existingUser)
      throw new ApiErrorHandler(401, "User with this email already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await User.create({
      ...data,
      password: hashedPassword,
    })
      .then((res) => {
        const { password, ...user } = res.toObject();
        return user;
      })
      .catch((err) => Promise.reject(err));
  },

  changePassword: async (data) => {
    const { email, oldPassword, newPassword } = data;
    const userExisting = await User.findOne({ email });

    if (!userExisting) throw new ApiErrorHandler(401, "User not found");
    const isPasswordMatch = await utils.comparePassword(
      oldPassword,
      userExisting.password
    );
    if (!isPasswordMatch)
      throw new ApiErrorHandler(401, "Password is incorrect");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return await User.findOneAndUpdate({ email }, { password: hashedPassword })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
};
