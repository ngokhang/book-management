import moment from "moment-timezone";
import { TIMEZONE } from "../constants/index.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Order } from "../model/Order.js";

const AnalystServices = {
  getOrder: async ({ month, userId, page, limit }) => {
    const filter = {};
    const options = { page, limit };

    if (month) {
      const [startRange, endRange] = month;
      if (endRange && startRange > endRange)
        throw new ApiErrorHandler(400, "Invalid time range");

      const startRangeTimestamp = moment()
        .tz(TIMEZONE)
        .month(startRange - 1)
        .startOf("month")
        .valueOf();
      const endRangeTimestamp = moment()
        .tz(TIMEZONE)
        .month(endRange - 1)
        .startOf("month")
        .valueOf();

      if (startRange && endRange) {
        filter.borrowDate = { $gte: startRangeTimestamp };
        filter.dueDate = { $lte: endRangeTimestamp };
      } else if (startRange === endRange || !endRange) {
        filter.borrowDate = { $gte: startRangeTimestamp };
        filter.dueDate = { $gte: startRangeTimestamp };
      }
    }
    if (userId) {
      filter.userId = userId;
    }

    return await Order.paginate(filter, options);
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
