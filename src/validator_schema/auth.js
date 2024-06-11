import Joi from "joi";
import { REGEX_NAME } from "../constants/index.js";

const auth = {
  changePassword: Joi.object().keys({
    oldPassword: Joi.string().required().min(6),
    newPassword: Joi.string().required().min(6),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .min(6)
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match" }),
  }),
  requestChangePassword: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  setNewPassword: Joi.object().keys({
    resetToken: Joi.string().length(3).max(6).required(),
    newPassword: Joi.string().length(3).min(6).required(),
  }),
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  register: Joi.object().keys({
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
};

export default auth;
