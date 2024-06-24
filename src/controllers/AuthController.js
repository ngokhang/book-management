import "dotenv/config";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import { response } from "../helpers/response.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { AuthServices } from "../services/AuthServices.js";
import { JwtServices } from "../services/JwtServices.js";
import ms from "ms";
import { Token } from "../model/token.js";
import { utils } from "../utils/index.js";
import { REFRESH_TOKEN, TIMEZONE } from "../constants/index.js";
import moment from "moment";

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
          maxAge: ms(process.env.REFRESH_TOKEN_LIFE),
        });

        return response(res, 200, "Login successful", {
          ...user,
          accessToken,
          refreshToken,
        });
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

    return response(
      res,
      201,
      "User created successfully",
      await AuthServices.register(data),
    );
  },
  refreshToken: async (req, res, next) => {
    const accessToken = req.header("authorization").split(" ")[1];
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken) return next(new ApiErrorHandler(401, "Unauthorized"));
    if (!refreshToken)
      return next(new ApiErrorHandler(400, "Missing refreshToken"));

    const refreshTokenInDB = await Token.findOne({
      value: {
        $eq: refreshToken,
      },
    });
    if (refreshTokenInDB.expiresAt < Date.now() / 1000) {
      await Token.findOneAndDelete({
        value: refreshToken,
        type: REFRESH_TOKEN,
      });
      res.clearCookie("refresh_token");
      throw new ApiErrorHandler(
        401,
        "Refresh token is expired. Please login again",
      );
    }

    const { exp } = JwtServices.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const isExpiredToken = JwtServices.isTokenExpired(exp);
    if (isExpiredToken) return next(new ApiErrorHandler(401, "Token expired"));

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await JwtServices.refreshToken(refreshToken);

    await Token.findOneAndUpdate(
      { _id: refreshTokenInDB._id },
      {
        value: newRefreshToken,
        expiresAt: moment()
          .tz(TIMEZONE)
          .add(ms(process.env.REFRESH_TOKEN_LIFE), "milliseconds"),
      },
    );

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return response(res, 201, "Token refreshed", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  },
  changePassword: async (req, res, next) => {
    const { email } = getUserDataFromToken(req);
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!email) return next(new ApiErrorHandler(401, "Unauthorized access"));

    return response(
      res,
      200,
      "Password changed successfully",
      await AuthServices.changePassword({
        email,
        oldPassword,
        newPassword,
        confirmPassword,
      }),
    );
  },
  logout: async (req, res, next) => {
    const refresh_token = req.cookies.refresh_token;

    if (refresh_token === undefined) {
      throw new ApiErrorHandler(401, "Unauthorized");
    }

    await Token.findOneAndDelete({ value: refresh_token });

    res.clearCookie("refresh_token");
    return response(res, 200, "Logout", { message: "Logout successful" });
  },
  forgotPassword: async (req, res) => {
    const { email, tokenReset } = req.body;

    return response(
      res,
      200,
      "Reset password",
      await AuthServices.forgotPassword({ email, tokenReset }),
    );
  },
  validateToken: async (req, res) => {
    const accessToken = req.headers["authorization"].split(" ")[1];
    const { exp } = JwtServices.decode(accessToken);
    const isTokenExpired = utils.checkExpires(exp);

    if (isTokenExpired) throw new ApiErrorHandler(401, "Token is expired");

    return response(res, 200, "Validate token", {
      message: "Token still live",
    });
  },
};
