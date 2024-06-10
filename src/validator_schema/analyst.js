import Joi from "joi";
import moment from "moment";

const analyst = {
  getOrder: Joi.object().keys({
    month: Joi.array()
      .items(
        Joi.number()
          .integer()
          .positive()
          .min(1)
          .max(12)
          .optional()
          .default(moment().get("month")),
      )
      .optional(),
    userId: Joi.string().hex().length(24).optional(),
    page: Joi.number().integer().positive().greater(0).default(1).optional(),
    limit: Joi.number().integer().positive().greater(0).default(10).optional(),
  }),
};

export default analyst;
