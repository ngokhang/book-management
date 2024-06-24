import { JwtServices } from "../services/JwtServices.js";
import "dotenv/config";
import ApiErrorHandler from "./ApiErrorHandler.js";
import { utils } from "../utils/index.js";

export default function AuthenticatedMiddleware() {
  return (req, res, next) => {
    if (!req.headers["authorization"])
      return res.status(401).json({ message: "Unauthorized" });
    const accessToken = req.headers["authorization"].split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });
    if (accessToken) {
      try {
        const { exp, _id, role } = JwtServices.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (utils.checkExpires(exp)) {
          return next(new ApiErrorHandler(401, "Token expired"));
        }
        if (role === "admin") return next();
        if (req.params.id && _id !== req.params.id)
          return next(new ApiErrorHandler(403, "Forbidden"));
        const { userId } = req.body;
        if (userId && userId.toString() !== _id.toString())
          throw new ApiErrorHandler(403, "Forbidden");
      } catch (error) {
        throw new ApiErrorHandler(400, "Invalid Token! Please log in again");
      }
    }
    next();
  };
}
