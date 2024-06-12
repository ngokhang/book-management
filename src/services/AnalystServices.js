import moment from "moment-timezone";
import { TIMEZONE } from "../constants/index.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Order } from "../model/Order.js";

const AnalystServices = {
  getOrder: async ({ month, userId, page, limit }) => {
    try {
      const filter = {};
      const options = { page, limit };

      if (month) {
        let [startRange, endRange] = month;
        if (endRange && startRange > endRange)
          throw new ApiErrorHandler(400, "Invalid time range");
        if (!endRange || startRange === endRange) endRange = startRange;

        console.log(startRange, endRange);

        const startRangeTimestamp = new Date(2024, startRange - 1, 2).getTime(); // 01/01/2024
        let endRangeTimestamp = new Date(2024, endRange, 1).getTime(); // 31/1/2024

        if (startRange && endRange) {
          filter.borrowDate = { $gte: startRangeTimestamp };
          filter.dueDate = { $lt: endRangeTimestamp };
        } else if (startRange === endRange || !endRange) {
          filter.borrowDate = { $gte: startRangeTimestamp };
          filter.dueDate = { $lt: endRangeTimestamp };
        }
      }
      if (userId) {
        filter.userId = userId;
      }

      const response = await Order.paginate(filter, options);

      return response;
    } catch (error) {
      throw error;
    }
  },

  getMostBorrowedBooksDescending: async () => {
    try {
      return await Order.aggregate([
        {
          $lookup: {
            from: "books",
            localField: "bookId",
            foreignField: "_id",
            as: "bookId",
          },
        },
        {
          $group: {
            _id: "$bookId",
            count: { $sum: "$quantity" },
          },
        },
        {
          $project: {
            _id: {
              name: 1,
              categories: 1,
            },
            count: 1,
          },
        },
        {
          $project: {
            book: "$_id",
            count: 1,
          },
        },
        {
          $unwind: "$book",
        },
        {
          $replaceWith: {
            $mergeObjects: ["$$ROOT", "$book"],
          },
        },
        {
          $unset: ["_id", "book"],
        },
        {
          $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categories",
          },
        },
      ]).sort({
        count: -1,
      });
    } catch (err) {
      throw err;
    }
  },
};

export default AnalystServices;
