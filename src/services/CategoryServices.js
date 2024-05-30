import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Categories } from "../model/Categories.js";

export const CategoryServices = {
  getAll: async (data) => {
    return Categories.paginate(
      { name: { $regex: data.name || "", $options: "i" } },
      { page: data._page, limit: data._limit },
      function (err, result) {
        if (err) {
          return Promise.reject(err);
        }
        return result;
      }
    );
  },
  get: async (data) => {
    return Categories.findOne({ ...data })
      .then((result) => result)
      .catch((err) => Promise.reject(err));
  },
  create: async (data) => {
    const { categories } = data;

    await Categories.collection.indexExists("name_1").then((result) => {
      if (!result) {
        Categories.collection.createIndex({ name: 1 }, { unique: true });
      }
    });

    return await Categories.collection
      .insertMany(categories)
      .then((result) => result)
      .catch((err) => Promise.reject(err));
  },
  update: async (data) => {
    return Categories.findOneAndUpdate(
      { _id: data._id },
      { ...data },
      { new: true }
    )
      .then((result) => result)
      .catch((err) => Promise.reject(err));
  },
  delete: async (data) => {
    return Categories.findOneAndDelete({ _id: data._id })
      .then((result) => {
        if (!result) {
          return Promise.reject(new ApiErrorHandler(400, "Category not found"));
        }
        return result;
      })
      .catch((err) => Promise.reject(err));
  },
  deleteMany: async (data) => {
    return Categories.deleteMany({ _id: { $in: data.categories_selected } })
      .then((result) => {
        if (result.deletedCount === 0) {
          return Promise.reject(
            new ApiErrorHandler(400, "Categories not found")
          );
        }
        return result;
      })
      .catch((err) => Promise.reject(err));
  },
  deleteAll: async () => {
    return Categories.deleteMany({})
      .then((result) => result)
      .catch((err) => Promise.reject(err));
  },
};
