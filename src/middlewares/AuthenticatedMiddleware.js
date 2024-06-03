import { JwtServices } from "../services/JwtServices.js";
import "dotenv/config";
import ApiErrorHandler from "./ApiErrorHandler.js";

export default function AuthenticatedMiddleware() {
  return (req, res, next) => {
    if (!req.headers["authorization"])
      return res.status(401).json({ message: "Unauthorized" });
    const accessToken = req.headers["authorization"].split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });
    if (accessToken) {
      const { exp, _id, role } = JwtServices.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );
      if (Date.now() >= exp * 1000) {
        return next(new ApiErrorHandler(401, "Unauthorized"));
      }
      if (role !== "admin" && req.params.id && _id !== req.params.id)
        return next(new ApiErrorHandler(403, "Forbidden"));
    }
    next();
  };
}
