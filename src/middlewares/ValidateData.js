export default function validateData(schema) {
  return (req, res, next) => {
    const { body, query } = req;

    const { error } = schema.validate(body);
    let errorQuery = null;
    if (Object.keys(query).length > 0) {
      for (const keys in query) {
        if (query[keys].startsWith("[")) query[keys] = JSON.parse(query[keys]);
      }
      let { values, error } = schema.validate(query);
      errorQuery = error;
    }

    const valid = error == null;
    const validQuery = errorQuery == null;

    if (valid && validQuery) {
      next();
    } else {
      const { details } = error || errorQuery;
      const message = details.map((i) => i.message).join(",");

      res.status(422).json({ error: message });
    }
  };
}
