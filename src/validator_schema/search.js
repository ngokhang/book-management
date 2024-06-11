import Joi from "joi";

const search = {
  book: Joi.object().keys({
    q: Joi.string().allow(""),
    page: Joi.number().integer().positive().greater(0).default(1),
    limit: Joi.number().integer().positive().greater(0).default(10),
    category: Joi.string().allow("").optional(),
    author: Joi.string().allow("").optional(),
  }),
};

export default search;
