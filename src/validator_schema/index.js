import Joi from "joi";

export const schemas = {
  createNewUserSchema: Joi.object().keys({
    firstName: Joi.string()
      .required()
      .messages({ "any.required": "First name is required" }),
    lastName: Joi.string()
      .required()
      .messages({ "any.required": "Last name is required" }),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  updateUserSchema: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
  }),

  changePasswordSchema: Joi.object().keys({
    oldPassword: Joi.string().required().min(6),
    newPassword: Joi.string().required().min(6),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .min(6)
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match" }),
  }),
};
