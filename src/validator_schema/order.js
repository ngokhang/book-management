import Joi from "joi";

const order = {
  create: Joi.object().keys({
    bookId: Joi.string().required(),
    userId: Joi.string().required(),
    borrowDate: Joi.date().required(),
    dueDate: Joi.date().required().iso().greater(Joi.ref("borrowDate")),
    status: Joi.string(),
  }),

  update: Joi.object().keys({
    bookId: Joi.string().hex().length(24),
    status: Joi.string(),
    borrowDate: Joi.date(),
    _id: Joi.string(),
  }),
};

export default order;
