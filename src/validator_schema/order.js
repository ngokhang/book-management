import Joi from "joi";
import { BORROWED } from "../constants/index.js";

const order = {
  create: Joi.object().keys({
    books: Joi.array().items(
      Joi.object().keys({
        _id: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().greater(0).default(1),
      }),
    ),
    userId: Joi.string().hex().length(24),
    borrowDate: Joi.date().timestamp().required(),
    dueDate: Joi.date().timestamp().greater(Joi.ref("borrowDate")).required(),
    status: Joi.string().default(BORROWED),
    totalPrice: Joi.number().greater(0).required(),
  }),

  update: Joi.object().keys({
    userId: Joi.string().hex().length(24),
    status: Joi.string().required(),
    borrowDate: Joi.date().timestamp().greater(0),
    dueDate: Joi.date().timestamp().greater(Joi.ref("borrowDate")),
    books: Joi.array().items(
      Joi.object().keys({
        _id: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().greater(0).default(1).required(),
      }),
    ),
  }),

  delete: Joi.object().keys({
    orderIdList: Joi.array()
      .items(Joi.string().hex().length(24))
      .min(1)
      .required(),
  }),
};

export default order;
