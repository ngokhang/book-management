import Joi from "joi";
import { REGEX_NAME } from "../constants/index.js";

const book = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    categories: Joi.array().items(Joi.string().hex().length(24)).required(),
    author: Joi.string().regex(REGEX_NAME, "human name").required(),
    description: Joi.string(),
    thumbnail: Joi.string(),
    isPublished: Joi.boolean().default(true),
    quantity: Joi.number().integer().greater(-1),
    price: Joi.number().greater(0).required(),
  }),

  update: Joi.object().keys({
    name: Joi.string().min(1),
    categories: Joi.array().items(Joi.string().hex().length(24)).min(1),
    author: Joi.string().regex(REGEX_NAME, "human name"),
    description: Joi.string(),
    thumbnail: Joi.string(),
    isPublished: Joi.boolean(),
    quantity: Joi.number().integer().greater(-1),
  }),

  delete: Joi.object().keys({
    arrayId: Joi.array().items(Joi.string().hex().length(24)),
  }),
};

export default book;
