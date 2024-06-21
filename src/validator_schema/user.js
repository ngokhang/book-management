import Joi from "joi";
import { REGEX_NAME } from "../constants/index.js";
import moment from "moment";

const user = {
  create: Joi.object().keys({
    firstName: Joi.string()
      .regex(REGEX_NAME, "human name")
      .required()
      .messages({ "any.required": "First name is required" }),
    lastName: Joi.string()
      .regex(REGEX_NAME, "human name")
      .required()
      .messages({ "any.required": "Last name is required" }),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  update: Joi.object().keys({
    firstName: Joi.string().regex(REGEX_NAME, "human name"),
    lastName: Joi.string().regex(REGEX_NAME, "human name"),
    email: Joi.string().email(),
    role: Joi.string().valid("user", "admin"),
  }),

  getOrders: Joi.object().keys({
    month: Joi.array()
      .items(
        Joi.number()
          .integer()
          .positive()
          .min(1)
          .max(12)
          .optional()
          .default(moment().get("month")),
      )
      .optional(),
    userId: Joi.string().hex().length(24).optional(),
    page: Joi.number().integer().positive().greater(0).default(1).optional(),
    limit: Joi.number().integer().positive().greater(0).default(10).optional(),
  }),
};

export default user;
