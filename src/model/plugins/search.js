const searchPlugin = (schema, options) => {
  schema.statics.search = async function (query, populateOptions) {
    const searchQuery = query.q;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build the search criteria
    const criteria = {
      $or: [],
    };

    // Add fields to search in the current schema
    options.fields.forEach((field) => {
      const searchCriteria = {};
      searchCriteria[field] = { $regex: searchQuery, $options: "i" };
      criteria.$or.push(searchCriteria);
    });

    // Handle population and search in referenced collections
    let queryBuilder = this.find(criteria).skip(skip).limit(limit);
    // if (populateOptions) {
    //   populateOptions.forEach((populateOption) => {
    //     queryBuilder = queryBuilder.populate({
    //       path: populateOption.path,
    //       match: populateOption.match
    //         ? {
    //             [populateOption.match]: { $regex: searchQuery, $options: "i" },
    //           }
    //         : undefined,
    //       populate: populateOption.populate,
    //     });
    //     console.log(JSON.stringify(queryBuilder.getQuery(), null, 2));
    //   });
    // }
    const results = await queryBuilder.exec();

    // const totalCount = await this.countDocuments(criteria);

    return {
      results,
      totalCount,
      totalPages: Math.ceil(totalCount || 10 / limit),
      currentPage: page,
    };
  };
};

export default searchPlugin;
