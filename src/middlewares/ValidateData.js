import { schemas } from "../validator_schema/index.js";

export default function validateData(schema) {
  return (req, res, next) => {
    const { error } = schemas.createNewUserSchema.validate(req.body);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");

      res.status(422).json({ error: message });
    }
  };
}
