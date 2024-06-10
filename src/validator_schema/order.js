import Joi from "joi";
import { BORROWED, TIMEZONE } from "../constants/index.js";
import moment from "moment";

const order = {
  create: Joi.object().keys({
    bookId: Joi.string().hex().length(24).required(),
    userId: Joi.string().hex().length(24).required(),
    borrowDate: Joi.number()
      .integer()
      .greater(moment().tz(TIMEZONE).valueOf())
      .default(new Date().getTime())
      .required(),
    dueDate: Joi.number()
      .integer()
      .greater(0)
      .required()
      .greater(Joi.ref("borrowDate"))
      .required(),
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
