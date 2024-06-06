import Joi from "joi";
import { REGEX_NAME } from "../constants/index.js";

export const schemas = {
  createNewUserSchema: Joi.object().keys({
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

  updateUserSchema: Joi.object().keys({
    firstName: Joi.string().regex(REGEX_NAME, "human name"),
    lastName: Joi.string().regex(REGEX_NAME, "human name"),
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
    categories: Joi.array().items(Joi.string().hex().length(24)).required(),
    author: Joi.string().regex(REGEX_NAME, "human name").required(),
    description: Joi.string(),
    thumbnail: Joi.string(),
    isPublished: Joi.boolean().default(true),
  }),

  updateBookSchema: Joi.object().keys({
    name: Joi.string().min(1),
    categories: Joi.array().items(Joi.string().hex().length(24)).min(1),
    author: Joi.string().regex(REGEX_NAME, "human name"),
    description: Joi.string(),
    thumbnail: Joi.string(),
    isPublished: Joi.boolean(),
  }),

  deleteBookSchema: Joi.object().keys({
    arrayId: Joi.array().items(Joi.string().hex().length(24)),
  }),

  createAuthorSchema: Joi.object().keys({
    name: Joi.string().required(),
  }),

  updateAuthorSchema: Joi.object().keys({
    name: Joi.string(),
  }),

  updateOrderSchema: Joi.object().keys({
    bookId: Joi.string().hex().length(24),
    status: Joi.string(),
    borrowDate: Joi.date(),
    _id: Joi.string(),
  }),
};
