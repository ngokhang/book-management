import express from "express";
import AnalystController from "../controllers/AnalystController.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import validateData from "../middlewares/ValidateData.js";
import { schemas } from "../validator_schema/index.js";

const AnalystRouter = express.Router();

AnalystRouter.route("/order").get(
  [CheckIsAdminMiddleware(), validateData(schemas.analyst.getOrder)],
  AnalystController.getOrder,
);

AnalystRouter.route("/book").get(
  AnalystController.getMostBorrowedBooksDescending,
);

export default AnalystRouter;
