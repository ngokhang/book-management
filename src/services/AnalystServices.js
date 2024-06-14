import moment from "moment-timezone";
import { BORROWED, TIMEZONE } from "../constants/index.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Order } from "../model/Order.js";
import getTimestampOfDate from "../utils/getTimestampOfDate.js";
import _ from "lodash";

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

        const startRangeTimestamp = getTimestampOfDate(
          1,
          startRange,
          new Date().getFullYear(),
        ); // Ex: 01/01/2024
        let endRangeTimestamp = getTimestampOfDate(
          0,
          endRange + 1,
          new Date().getFullYear(),
        ); // Ex: 31/1/2024

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
      const ordersInDB = await Order.find({});
      const bookListInOrders = ordersInDB.reduce((acc, curr) => {
        const { books } = curr;
        books.forEach((book) => {
          const newObj = JSON.parse(JSON.stringify(book));
          newObj["bookInfo"] = newObj["_id"];
          delete newObj["_id"];
          acc.push(newObj);
        });
        return acc;
      }, []);
      const result = bookListInOrders
        .reduce((acc, curr) => {
          const { bookInfo, quantity } = curr;
          const idxExisted = acc.findIndex(
            (item) => item.bookInfo._id === bookInfo._id,
          );
          if (idxExisted > -1) {
            acc[idxExisted] = {
              ...acc[idxExisted],
              quantity: acc[idxExisted].quantity + quantity,
            };
            return acc;
          }
          acc.push(curr);
          return acc;
        }, [])
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return result;
    } catch (err) {
      throw err;
    }
  },
};

export default AnalystServices;
