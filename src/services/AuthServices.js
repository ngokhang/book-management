import bcrypt from "bcrypt";
import "dotenv/config";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { User } from "../model/UserSchema.js";
import { JwtServices } from "./JwtServices.js";
import { utils } from "../utils/index.js";
import { Token } from "../model/token.js";
import { REFRESH_TOKEN, TIMEZONE } from "../constants/index.js";
import moment from "moment";
import ms from "ms";

export const AuthServices = {
  login: async (data) => {
    const { email, password } = data;
    const userExisting = await User.findOne({
      email,
    });

    // Check if user is not found
    if (!userExisting)
      throw new ApiErrorHandler(400, "User hasn't existed in the system");

    const { _id, firstName, lastName, role } = userExisting;

    // Check validity of password
    const isPasswordMatch = await bcrypt.compare(
      password,
      userExisting.password,
    );

    // Check if password is incorrect
    if (!isPasswordMatch)
      throw new ApiErrorHandler(401, "Email or password is invalid");

    // Generate access token and refresh token
    const accessToken = JwtServices.sign(
      { _id, firstName, lastName, role, email },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE,
    );
    const refreshToken = JwtServices.sign(
      { _id, firstName, lastName, role, email },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_LIFE,
    );

    await Token.create({
      typeToken: REFRESH_TOKEN,
      user: userExisting._id,
      value: refreshToken,
      expiresAt: moment()
        .tz(TIMEZONE)
        .add(ms(process.env.REFRESH_TOKEN_LIFE), "milliseconds"),
    });

    return {
      userExisting, // Return user data
      accessToken,
      refreshToken,
    };
  },

  register: async (data) => {
    const { email, password } = data;
    const existingUser = await User.findOne({ email });

    if (existingUser) throw new ApiErrorHandler(409, "This email has existed");

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    return await User.create({
      ...data,
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
      userExisting.password,
    );
    if (!isPasswordMatch)
      throw new ApiErrorHandler(401, "Current password is incorrect");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return await User.findOneAndUpdate({ email }, { password: hashedPassword })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },

  forgotPassword: async ({ email, tokenReset }) => {
    try {
      const emailInDB = await User.findOne({ email }).lean();
      const tokenResetInDB = await Token.findOne({ value: tokenReset }).lean();

      if (!emailInDB) throw new ApiErrorHandler(404, "Email not found");
      if (!tokenResetInDB) throw new ApiErrorHandler(400, "Invalid token");
    } catch (error) {
      throw error;
    }
  },
};
