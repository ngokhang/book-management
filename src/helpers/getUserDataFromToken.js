import "dotenv/config";
import { JwtServices } from "../services/JwtServices.js";

export default function getUserDataFromToken(req) {
  const accessToken = req.header("authorization").split(" ")[1];
  const decoded = JwtServices.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  return decoded;
}
