const paginatePlugin = (schema) => {
  schema.statics.paginate = async function (query, options) {
    if (!options || Object.keys(options).length === 0) {
      options.page = 1;
      options.limit = 10;
    }
    let { page, limit, select } = options;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(query);
    const docsPromise = this.find(query).skip(skip).limit(limit);
    const [count, docs] = await Promise.all([countPromise, docsPromise]);

    const totalPages = Math.ceil(count / limit);

    return {
      docs,
      totalDocs: count,
      totalPages,
      currentPage: Number.parseInt(page),
    };
  };
};

export default paginatePlugin;
