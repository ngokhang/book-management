const paginatePlugin = (schema) => {
  schema.statics.paginate = async function (query, options) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(query);
    const docsPromise = this.find(query).skip(skip).limit(limit);

    const [count, docs] = await Promise.all([countPromise, docsPromise]);

    const totalPages = Math.ceil(count / limit);

    return {
      docs,
      totalDocs: count,
      totalPages,
      currentPage: page,
    };
  };
};

export default paginatePlugin;
