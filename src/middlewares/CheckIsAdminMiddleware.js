import { JwtServices } from "../services/JwtServices.js";
import ApiErrorHandler from "./ApiErrorHandler.js";

export default function CheckIsAdminMiddleware() {
  return (req, res, next) => {
    const accessToken = req.header("authorization").split(" ")[1];
    const { role } = JwtServices.decode(accessToken);
    if (role !== "admin") {
      return next(new ApiErrorHandler(403, "Forbidden"));
    }

    next();
  };
}
