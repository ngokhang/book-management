import Joi from "joi";

const category = {
  create: Joi.object({
    categories: Joi.array()
      .items({
        name: Joi.string().required(),
        description: Joi.string().required(),
        isPublished: Joi.boolean().default(true).required(),
      })
      .required()
      .min(1),
  }).required(),
};

export default category;
