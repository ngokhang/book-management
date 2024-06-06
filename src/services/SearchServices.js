import { Book } from "../model/Book.js";

const SearchServices = {
  searchBook: async ({ query: { q, _page, _limit } }) => {
    try {
      return await Book.aggregate(
        [
          {
            $skip: (Number.parseInt(_page) - 1) * 10 || 0,
          },
          {
            $limit: Number.parseInt(_limit) || 0,
          },
          {
            $lookup: {
              from: "authors",
              localField: "author",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categories",
              foreignField: "_id",
              as: "categories",
            },
          },
          {
            $unwind: "$author",
          },
          {
            $match: {
              $or: [
                { name: { $regex: q, $options: "i" } },
                {
                  "author.name": { $regex: q, $options: "i" },
                },
                {
                  "categories.name": { $regex: q, $options: "i" },
                },
              ],
            },
          },
        ],
        { page: 1, limit: 10 },
      );
    } catch (error) {
      throw error;
    }
  },
};

export default SearchServices;
