import Joi from "joi";
import { REGEX_NAME } from "../constants/index.js";
import user from "./user.js";
import auth from "./auth.js";
import order from "./order.js";
import book from "./book.js";
import category from "./category.js";

export const schemas = {
  user: { ...user },
  auth: { ...auth },
  category: { ...category },
  order: { ...order },
  book: { ...book },
};
