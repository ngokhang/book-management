import { Book } from "../model/Book.js";
import _ from "lodash";

const SearchServices = {
  searchBook: async ({ query: { q, _page, _limit } }) => {
    try {
      const response = await Book.aggregate(
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
          {
            $project: {
              name: 1,
              description: 1,
              thumbnail: 1,
              "author._id": 1,
              "author.name": 1,
              "categories._id": 1,
              "categories.name": 1,
            },
          },
        ],
        { page: 1, limit: 10 },
      );
      const totalDocuments = response.length;
      const totalPages = Math.ceil(totalDocuments / _limit || 10);
      return {
        docs: response,
        totalDocuments,
        totalPages,
        currentPage: _page,
        limit: _limit,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default SearchServices;
