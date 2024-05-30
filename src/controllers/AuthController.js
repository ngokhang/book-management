import "dotenv/config";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { AuthServices } from "../services/AuthServices.js";
import { JwtServices } from "../services/JwtServices.js";
import { response } from "../helpers/response.js";
import getAccessToken from "../helpers/getAccessToken.js";

export const AuthController = {
  login: async (req, res, next) => {
    const { email, password } = req.body;
    const data = {
      email,
      password,
    };

    return await AuthServices.login(data)
      .then((result) => {
        const { accessToken, refreshToken, userExisting: userData } = result;
        const { password, ...user } = userData.toObject();

        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        return response(res, 200, "Login successful", { ...user, accessToken });
      })
      .catch((err) => {
        next(err);
      });
  },
  register: async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const data = {
      firstName,
      lastName,
      email,
      password,
    };

    return await AuthServices.register(data)
      .then((result) => response(res, 201, "User created successfully", result))
      .catch((err) => {
        next(err);
      });
  },
  refreshToken: async (req, res, next) => {
    const accessToken = req.header("authorization").split(" ")[1];
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken)
      return next(new ApiErrorHandler(400, "Refresh token is required"));

    const { exp } = JwtServices.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const isExpiredToken = JwtServices.isTokenExpired(exp);
    if (isExpiredToken) return next(new ApiErrorHandler(401, "Token expired"));

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      JwtServices.refreshToken(
        refreshToken,
        {
          accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
          refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        },
        JwtServices.decode(accessToken)
      );

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return response(res, 201, "Token refreshed", {
      accessToken: newAccessToken,
    });
  },
  changePassword: async (req, res, next) => {
    const accessToken = getAccessToken(req);
    const { email } = JwtServices.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!email) return next(new ApiErrorHandler(401, "Unauthorized access"));

    return await AuthServices.changePassword({
      email,
      oldPassword,
      newPassword,
      confirmPassword,
    })
      .then((result) =>
        response(res, 200, "Password changed successfully", result)
      )
      .catch((err) => {
        next(err);
      });
  },
};