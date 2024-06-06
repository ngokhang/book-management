import Joi from "joi";
import { REGEX_NAME } from "../constants/index.js";

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
  }),
};

export default user;
