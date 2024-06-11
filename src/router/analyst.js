import express from "express";
import AnalystController from "../controllers/AnalystController.js";
import validateData from "../middlewares/ValidateData.js";
import { schemas } from "../validator_schema/index.js";
import { utils } from "../utils/index.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";

const AnalystRouter = express.Router();

AnalystRouter.route("/order").get(
  [validateData(schemas.analyst.getOrder)],
  utils.asyncHandler(AnalystController.getOrder),
);

AnalystRouter.route("/book").get(
  AnalystController.getMostBorrowedBooksDescending,
);

export default AnalystRouter;
