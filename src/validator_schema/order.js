import Joi from "joi";
import { BORROWED } from "../constants/index.js";

const order = {
  create: Joi.object().keys({
    bookId: Joi.string().hex().length(24).required(),
    userId: Joi.string().hex().length(24),
    borrowDate: Joi.date().timestamp().required(),
    dueDate: Joi.date().timestamp().greater(Joi.ref("borrowDate")).required(),
    status: Joi.string().default(BORROWED),
    quantity: Joi.number().integer().positive().default(1).required(),
  }),

  update: Joi.object().keys({
    bookId: Joi.string().hex().length(24),
    status: Joi.string(),
    borrowDate: Joi.number().integer().greater(0),
    dueDate: Joi.number().integer().greater(0).greater(Joi.ref("borrowDate")),
    quantity: Joi.number().integer().greater(0).positive(),
  }),

  delete: Joi.object().keys({
    orderIdList: Joi.array()
      .items(Joi.string().hex().length(24))
      .min(1)
      .required(),
  }),
};

export default order;
