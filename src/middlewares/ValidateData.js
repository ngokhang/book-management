import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { createNewUserSchema } from "../validator_schema/index.js";

export default function validateData(schema) {
  return (req, res, next) => {
    const { error } = createNewUserSchema.validate(req.body);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");

      console.log(message);
      res.status(422).json({ error: message });
    }
  };
}
