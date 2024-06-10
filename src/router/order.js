import express from "express";
import { OrderController } from "../controllers/OderController.js";
import validateData from "../middlewares/ValidateData.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import { schemas } from "../validator_schema/index.js";
import { utils } from "../utils/index.js";

const OrderRouter = express.Router();

OrderRouter.route("/")
  .get(AuthenticatedMiddleware(), utils.asyncHandler(OrderController.getAll))
  .post(
    [AuthenticatedMiddleware(), validateData(schemas.order.create)],
    utils.asyncHandler(OrderController.create),
  )
  .delete(
    [CheckIsAdminMiddleware(), validateData(schemas.order.delete)],
    utils.asyncHandler(OrderController.delete),
  );
OrderRouter.route("/:orderId").patch(
  [AuthenticatedMiddleware(), validateData(schemas.order.update)],
  utils.asyncHandler(OrderController.update),
);

export default OrderRouter;
