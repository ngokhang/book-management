import { Book } from "../model/Book.js";
import _ from "lodash";

const SearchServices = {
  searchBook: async ({ q = "", page = 1, limit = 10, category, author }) => {
    let matchStage = {
      $or: [],
    };

    console.log(matchStage);

    if (q) matchStage.$or.push({ name: { $regex: q || "", $options: "i" } });
    if (category)
      matchStage.$or.push({
        "categories.name": { $regex: category || "", $options: "i" },
      });
    if (author)
      matchStage.$or.push({ author: { $regex: author || "", $options: "i" } });
    if (matchStage.$or.length === 0) matchStage = {};

    try {
      const response = await Book.aggregate(
        [
          {
            $skip: (Number.parseInt(page) - 1) * 10 || 0,
          },
          {
            $limit: Number.parseInt(limit) || 0,
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
            $match: matchStage,
          },
          {
            $project: {
              name: 1,
              description: 1,
              thumbnail: 1,
              author: 1,
              quantity: 1,
              "categories._id": 1,
              "categories.name": 1,
            },
          },
        ],
        { page: 1, limit: 10 },
      );
      const totalDocs = response.length;
      const totalPages = Math.ceil(totalDocs / limit || 0);
      return {
        docs: response,
        totalDocs,
        totalPages,
        currentPage: Number.parseInt(page),
      };
    } catch (error) {
      throw error;
    }
  },
};

export default SearchServices;
