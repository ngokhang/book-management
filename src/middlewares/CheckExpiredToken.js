import { JwtServices } from "../services/JwtServices.js";
import ApiErrorHandler from "./ApiErrorHandler.js";

export default function CheckExpiredToken() {
  return (req, res, next) => {
    const accessToken = req.header("authorization").split(" ")[1];
    const { exp } = JwtServices.decode(accessToken);
    if (Date.now() >= exp * 1000) {
      return next(new ApiErrorHandler(401, "Token expired"));
    }

    next();
  };
}
