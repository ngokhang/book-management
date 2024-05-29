import { User } from "../model/UserSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

export const AuthServices = {
  login: async (data) => {
    const { email, password } = data;
    const userExisting = await User.findOne({
      email,
    });

    // Check if user is not found
    if (!userExisting) throw new Error("User not found");

    const { _id, firstName, lastName, role } = userExisting;

    // Check validity of password
    const isPasswordMatch = await bcrypt.compare(
      password,
      userExisting.password
    );

    // Check if password is incorrect
    if (!isPasswordMatch) throw new Error("Password is incorrect");

    // Generate access token and refresh token
    const accessToken = await jwt.sign(
      { _id, firstName, lastName, role, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60s" }
    );
    const refreshToken = await jwt.sign(
      { _id, firstName, lastName, role, email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
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

    if (existingUser) throw new Error("User with this email already exists");

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
};
