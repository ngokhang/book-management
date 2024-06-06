import Joi from "joi";

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
};

export default auth;
