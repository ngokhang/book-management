import "dotenv/config";
import { JwtServices } from "../services/JwtServices.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";

export default function getUserDataFromToken(req) {
  if (!req.header("authorization")) {
    throw new ApiErrorHandler(401, "Unauthorized");
  }
  const accessToken = req.header("authorization").split(" ")[1];
  const decoded = JwtServices.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
  );
  return decoded;
}
