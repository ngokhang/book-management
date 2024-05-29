import Joi from "joi";

export const createNewUserSchema = Joi.object().keys({
  firstName: Joi.string()
    .required()
    .messages({ "any.required": "First name is required" }),
  lastName: Joi.string()
    .required()
    .messages({ "any.required": "Last name is required" }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
