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

  createCategorySchema: Joi.object({
    categories: Joi.array()
      .items({
        name: Joi.string().required(),
        description: Joi.string().required(),
      })
      .required()
      .min(1),
  }).required(),

  createOrderSchema: Joi.object().keys({
    bookId: Joi.string().required(),
    userId: Joi.string().required(),
    borrowDate: Joi.date().required(),
    dueDate: Joi.date().required().iso().greater(Joi.ref("borrowDate")),
    status: Joi.string(),
  }),

  createBookSchema: Joi.object().keys({
    name: Joi.string().required(),
    categories: Joi.array().items(Joi.string()).required(),
    author: Joi.array().items(Joi.string()).required(),
    description: Joi.string(),
    thumbnail: Joi.string().required(),
  }),

  updateBookSchema: Joi.object().keys({
    name: Joi.string().required().min(3),
    categories: Joi.array().items(Joi.string()).min(1).required(),
    author: Joi.array().items(Joi.string()).min(1).required(),
    description: Joi.string(),
    thumbnail: Joi.string().required(),
  }),

  createAuthorSchema: Joi.object().keys({
    name: Joi.string().required(),
  }),

  updateAuthorSchema: Joi.object().keys({
    name: Joi.string().required(),
  }),

  updateOrderSchema: Joi.object().keys({
    bookId: Joi.string().required(),
    status: Joi.string().required(),
    borrowDate: Joi.date().required(),
    _id: Joi.string().required(),
  }),
};
