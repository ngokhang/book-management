import moment from "moment-timezone";
import mongoose from "mongoose";
import { BORROWED, RETURNED, TIMEZONE } from "../constants/index.js";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Book } from "../model/Book.js";
import { Order } from "../model/Order.js";

export const OrderServices = {
  getAll: async ({ page, limit, role, userId }) => {
    try {
      if (page < 0 || limit < 0) {
        throw new ApiErrorHandler(
          400,
          "Page and limit must be positive number",
        );
      }

      const options = {
        page,
        limit,
      };
      const filter = {};

      if (role === "user") {
        filter.userId = userId;
      }

      const orderList = await Order.paginate(filter, options);

      return orderList;
    } catch (error) {
      throw error;
    }
  },

  create: async (orderData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        userId,
        bookId,
        borrowDate,
        dueDate,
        status = BORROWED,
        quantity,
      } = orderData;

      // check existed book with bookId
      const book = await Book.findOne({
        _id: bookId,
        isPublished: true,
      }).lean();
      if (!book) throw new ApiErrorHandler(404, `${book.name} not found`);

      // Check if quantity is equal to 0, push notification the number of days that user can borrow earliest
      if (book.quantity === 0) {
        const orderListWithBookId = await Order.find({
          bookId,
        })
          .sort({ dueDate: 1 }) // sort by dueDate asc
          .lean();
        let { dueDate: nextAvailableBorrowDate } = orderListWithBookId[0]; // nextAvailableBorrowDate is dueDate earliest that user can borrow

        throw new ApiErrorHandler(
          400,
          `${book.name}'s quantity not enough. Please try again after ${moment(
            nextAvailableBorrowDate,
          ).fromNow()}`,
        );
      }

      // Check if quantity > remaining, return error
      if (book.quantity < quantity)
        throw new ApiErrorHandler(400, `${book.name}'s quantity not enough.`);

      // Check the number of day that user want to borrow, must not be greater than one week
      if (moment(dueDate).diff(borrowDate, "day") > 7) {
        throw new ApiErrorHandler(
          400,
          `You can only borrow ${book.name} 7 days`,
        );
      }

      // calculate quantity book that user can borrow in day, user only borrow 10 books/day
      const quantityOrderTodayQuery = await Order.aggregate([
        {
          $match: {
            status: {
              $eq: BORROWED,
            },
          },
        },
        {
          $match: {
            borrowDate: {
              $gte: moment().tz(TIMEZONE).startOf("day").valueOf(),
              $lt: moment().tz(TIMEZONE).endOf("day").valueOf(),
            },
          },
        },
        {
          $group: { _id: "$userId", value: { $sum: "$quantity" } },
        },
      ]);
      const { value: quantityOrderToday } = quantityOrderTodayQuery[0] || 1;

      if (quantityOrderToday + quantity > 5)
        throw new ApiErrorHandler(400, "You can borrow only 5 books per day");

      await Book.findOneAndUpdate(
        { _id: bookId },
        {
          quantity: book.quantity - quantity,
        },
      );

      const newOrder = await Order.create({
        userId,
        bookId,
        dueDate,
        status: status || BORROWED,
        quantity: Number.parseInt(quantity),
      });

      await session.commitTransaction();
      delete newOrder.bookId;
      return newOrder;
    } catch (error) {
      // console.log(error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  update: async ({ updateData, orderId }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        quantity: bookQuantityUserChange,
        bookId: newBookId,
        status,
      } = updateData;
      const existingOrder = await Order.findOne({ _id: orderId });
      if (!existingOrder) throw new ApiErrorHandler(404, "Order not found");
      if (existingOrder.status === RETURNED)
        throw new ApiErrorHandler(400, "This order has returned");
      const { bookId: bookInOrder } = existingOrder;

      if (bookQuantityUserChange > 5)
        throw new ApiErrorHandler(400, "Invalid book quantity want to borrow");

      if (status === RETURNED) {
        const { bookId: bookInOrder } = existingOrder;
        const bookQuantityInOrder = existingOrder.quantity;

        await Book.updateOne(
          { _id: bookInOrder._id },
          { quantity: bookInOrder.quantity + existingOrder.quantity },
        );

        const updateOrder = await Order.updateOne(
          { _id: existingOrder._id },
          {
            status: RETURNED,
          },
          { new: true },
        ).lean();

        await session.commitTransaction();
        return updateOrder;
      }

      if (!bookQuantityUserChange) {
        await Book.findOneAndUpdate(
          { _id: bookInOrder._id },
          { quantity: bookInOrder.quantity + existingOrder.quantity },
        );
        const updateOrder = await Order.updateOne(
          { _id: orderId },
          updateData,
        ).lean();

        await session.commitTransaction();
        return updateOrder;
      }
      // user change book
      if (bookInOrder._id.toString() !== newBookId.toString()) {
        const newBookUserChange = await Book.findOne({
          _id: newBookId,
        }).lean();
        if (bookQuantityUserChange > 5)
          throw new ApiErrorHandler(404, "You can borrow only 5 books per day");
        await Book.updateOne(
          { _id: bookInOrder._id },
          {
            quantity: bookInOrder.quantity + existingOrder.quantity,
          },
        );
        await Book.updateOne(
          {
            _id: newBookId,
          },
          { quantity: newBookUserChange.quantity - bookQuantityUserChange },
        );

        await session.commitTransaction();
        return await Order.updateOne({ _id: orderId }, updateData).lean();
      }

      await Book.updateOne(
        { _id: bookInOrder },
        {
          quantity:
            bookInOrder.quantity +
            existingOrder.quantity -
            bookQuantityUserChange,
        },
      );

      await session.commitTransaction();
      return await Order.updateOne({ _id: orderId }, updateData).lean();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  delete: async ({ orderIdList }) => {
    try {
      const listExistingOrder = await Order.find({
        _id: { $in: orderIdList },
      }).lean();

      if (listExistingOrder.length !== orderIdList.length)
        throw new ApiErrorHandler(404, "Some of orders not found");
      if (listExistingOrder.some((order) => order.status === BORROWED))
        throw new ApiErrorHandler(
          400,
          "Some of orders not returned, please check again!",
        );

      return await Order.deleteMany({
        _id: { $in: orderIdList },
      });
    } catch (error) {
      throw error;
    }
  },

  getOrderInMonth: async ({ query: { _page, _limit, month } }) => {
    const options = {
      page: _page || 1,
      limit: _limit || 10,
    };

    return await Order.paginate(
      {
        createdAt: {
          $gte: new Date(
            new Date().getFullYear(),
            month - 1 || new Date().getMonth(),
            1,
          ),
          $lt: new Date(
            new Date().getFullYear(),
            month || new Date().getMonth() + 1,
            1,
          ),
        },
      },
      options,
    )
      .then((result) => result)
      .catch((err) => {
        throw err;
      });
  },

  getUserOrders: async (req) => {
    const {
      params: { _userId },
      query: { _page, _limit, _month },
    } = req;

    const { role, _id } = getUserDataFromToken(req);

    switch (role) {
      case "user":
        if (_userId !== _id) throw new ApiErrorHandler(403, "Forbidden");
        break;

      default:
        break;
    }

    return await Order.paginate(
      {
        userId: _userId,
        createdAt: {
          $gte: new Date(
            new Date().getFullYear(),
            _month - 1 || new Date().getMonth(),
            1,
          ),
          $lt: new Date(
            new Date().getFullYear(),
            _month || new Date().getMonth() + 1,
            1,
          ),
        },
      },
      {
        page: _page || 1,
        limit: _limit || 10,
      },
    );
  },

  getMostBorrowedBook: async ({ query: { _page, _limit } }) => {
    return await Order.aggregate([
      {
        $group: {
          _id: "$bookId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: Number.parseInt(_limit) || 10,
      },
      {
        $skip: (Number.parseInt(_page) - 1) * Number.parseInt(_limit) || 0,
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $lookup: {
          from: "authors",
          localField: "book.author",
          foreignField: "_id",
          as: "book.author",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "book.categories",
          foreignField: "_id",
          as: "book.categories",
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          book: 1,
        },
      },
    ]);
  },
};
