import { JwtServices } from "../services/JwtServices.js";
import { utils } from "../utils/index.js";
import ApiErrorHandler from "./ApiErrorHandler.js";

export default function CheckIsAdminMiddleware() {
  return (req, res, next) => {
    if (!req.header("authorization")) {
      return next(new ApiErrorHandler(401, "Unauthorized"));
    }

    const accessToken = req.header("authorization").split(" ")[1];
    const { role, exp } = JwtServices.decode(accessToken);

    if (utils.checkExpires(exp)) {
      return next(new ApiErrorHandler(401, "Unauthorized"));
    }

    if (role !== "admin") {
      return next(new ApiErrorHandler(403, "Forbidden"));
    }

    next();
  };
}
