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
      validateData(schemas.order.create),
      CheckIsAdminMiddleware(),
    ],
    utils.asyncHandler(OrderController.create),
  )
  .patch(
    [AuthenticatedMiddleware(), validateData(schemas.order.update)],
    utils.asyncHandler(OrderController.update),
  );

// router order for user
OrderRouter.route("/")
  .get(AuthenticatedMiddleware(), utils.asyncHandler(OrderController.getAll))
  .post(
    [AuthenticatedMiddleware(), validateData(schemas.order.create)],
    utils.asyncHandler(OrderController.create),
  )
  .patch(
    [AuthenticatedMiddleware(), validateData(schemas.order.update)],
    utils.asyncHandler(OrderController.update),
  );

// router for get popular order in month
OrderRouter.route("/month").get(
  utils.asyncHandler(OrderController.getPopularOrderInMonth),
);

// router for get most borrowed book
OrderRouter.route("/most-borrowed").get(
  utils.asyncHandler(OrderController.getMostBorrowed),
);

// router for get user orders
OrderRouter.route("/:_userId").get(
  utils.asyncHandler(OrderController.getUserOrders),
);

export default OrderRouter;
