import express from "express";
import { OrderController } from "../controllers/OderController.js";
import validateData from "../middlewares/ValidateData.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import { schemas } from "../validator_schema/index.js";
import { utils } from "../utils/index.js";

const OrderRouter = express.Router();

// router order for admin
OrderRouter.route("/admin")
  .get(
    [AuthenticatedMiddleware(), CheckIsAdminMiddleware()],
    utils.asyncHandler(OrderController.getAll),
  )
  .post(
    [
      AuthenticatedMiddleware(),
      validateData(schemas.createOrderSchema),
      CheckIsAdminMiddleware(),
    ],
    utils.asyncHandler(OrderController.create),
  )
  .patch(
    [AuthenticatedMiddleware(), validateData(schemas.updateOrderSchema)],
    utils.asyncHandler(OrderController.update),
  );

// router order for user
OrderRouter.route("/")
  .get(AuthenticatedMiddleware(), utils.asyncHandler(OrderController.getAll))
  .post(
    [AuthenticatedMiddleware(), validateData(schemas.createOrderSchema)],
    utils.asyncHandler(OrderController.create),
  )
  .patch(
    [AuthenticatedMiddleware(), validateData(schemas.updateOrderSchema)],
    utils.asyncHandler(OrderController.update),
  );

export default OrderRouter;
