export default function validateData(schema) {
  return (req, res, next) => {
    const { body, query } = req;
    for (const keys in query) {
      if (query[keys].startsWith("[")) query[keys] = JSON.parse(query[keys]);
    }
    const { error } = schema.validate(body);
    const { error: errorQuery } = schema.validate(query);
    const valid = error == null;
    const validQuery = errorQuery == undefined;

    if (valid && validQuery) {
      next();
    } else {
      const { details } = error || errorQuery;
      const message = details.map((i) => i.message).join(",");

      res.status(422).json({ error: message });
    }
  };
}
