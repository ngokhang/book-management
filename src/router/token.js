import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";

const TokenRouter = express.Router();

TokenRouter.post(
  "/validate",
  [AuthenticatedMiddleware()],
  AuthController.validateToken,
);
TokenRouter.post("/refresh-token", AuthController.refreshToken);

export default TokenRouter;
