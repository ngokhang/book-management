import express from "express";
import { CategoryController } from "../controllers/CategoryController.js";
import validateData from "../middlewares/ValidateData.js";
import AuthenticatedMiddleware from "../middlewares/AuthenticatedMiddleware.js";
import CheckIsAdminMiddleware from "../middlewares/CheckIsAdminMiddleware.js";
import { schemas } from "../validator_schema/index.js";
import { utils } from "../utils/index.js";

const CategoryRouter = express.Router();

// Category routers
CategoryRouter.route("/")
  .get(CategoryController.getAll)
  .post(
    [
      validateData(schemas.createCategorySchema),
      AuthenticatedMiddleware(),
      CheckIsAdminMiddleware(),
    ],
    utils.asyncHandler(CategoryController.create),
  )
  .delete(
    CheckIsAdminMiddleware(),
    utils.asyncHandler(CategoryController.deleteMany),
  );
CategoryRouter.delete(
  "/delete-all",
  [CheckIsAdminMiddleware()],
  utils.asyncHandler(CategoryController.deleteAll),
);
CategoryRouter.route("/:_id")
  .get(utils.asyncHandler(CategoryController.get))
  .patch(
    [CheckIsAdminMiddleware()],
    utils.asyncHandler(CategoryController.update),
  )
  .delete(
    [CheckIsAdminMiddleware()],
    utils.asyncHandler(CategoryController.delete),
  );

export default CategoryRouter;
