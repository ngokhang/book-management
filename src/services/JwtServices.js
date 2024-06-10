import "dotenv/config";
import jwt from "jsonwebtoken";
import { utils } from "../utils/index.js";

export const JwtServices = {
  sign: (data, secret, expiresIn) => {
    return jwt.sign(data, secret, { expiresIn });
  },
  verify: (token, secret) => {
    return jwt.verify(token, secret, { ignoreExpiration: true });
  },
  decode: (token) => {
    return jwt.decode(token);
  },
  refreshToken: async (refresh_token, data) => {
    // Check if refresh token is expired
    const { exp } = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const isTokenExpired = utils.checkExpires(exp);
    if (isTokenExpired) {
      return null;
    }
    const { _id, iat, exp: oldExp, ...rest } = data;

    const newAccessToken = JwtServices.sign(
      rest,
      process.env.ACCESS_TOKEN_SECRET,
      "60s",
    );
    const newRefreshToken = JwtServices.sign(
      rest,
      process.env.REFRESH_TOKEN_SECRET,
      "1d",
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
  isTokenExpired: (exp) => utils.checkExpires(exp),
};
