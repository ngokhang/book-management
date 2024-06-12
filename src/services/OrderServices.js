import moment from "moment-timezone";
import mongoose from "mongoose";
import { BORROWED, RETURNED, TIMEZONE } from "../constants/index.js";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Book } from "../model/Book.js";
import { Order } from "../model/Order.js";
import getTimestampOfDate from "../utils/getTimestampOfDate.js";

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
    try {
      let { userId, books, borrowDate, dueDate, status = BORROWED } = orderData;
      console.log(
        getTimestampOfDate(1, new Date().getMonth(), new Date().getFullYear()),
      );

      // group by _id of book when duplicate
      books = books.reduce((acc, curr) => {
        const indexOfExisted = acc.findIndex(
          (element) => element._id === curr._id,
        );
        if (indexOfExisted > -1) {
          acc[indexOfExisted] = {
            ...acc[indexOfExisted],
            quantity: acc[indexOfExisted].quantity + curr.quantity,
          };
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);

      // Check valid book in order is valid
      await Promise.all(
        books.map(async (book) => {
          const findBookValid = await Book.findOne({ _id: book._id }).lean();
          if (!findBookValid)
            throw new ApiErrorHandler(400, "Some of the books is invalid");
          if (findBookValid.quantity === 0)
            throw new ApiErrorHandler(
              400,
              `${findBookValid.name} isn't enough to borrow`,
            );
          if (findBookValid.quantity < book.quantity)
            throw new ApiErrorHandler(
              400,
              `${findBookValid.name} isn't enough to borrow`,
            );
        }),
      ).catch((err) => {
        throw err;
      });

      // check the days that user want to borrow, not allow greater than 7
      if (moment(dueDate).diff(borrowDate, "day") > 7)
        throw new ApiErrorHandler(400, "You only borrow on 7 days");

      // check the quantity of books that user borrowed month, not allow greater 5 books/month
      const quantityOrderQuery = await Order.aggregate([
        {
          $match: {
            status: {
              $eq: BORROWED,
            },
            borrowDate: {
              $gte: new Date(
                new Date().getFullYear,
                new Date().getMonth > 9
                  ? new Date().getMonth() - 1
                  : `0${new Date().getMonth() - 1}`,
                2,
              ).getTime(),
              $lt: new Date(
                new Date().getFullYear,
                new Date().getMonth > 9
                  ? new Date().getMonth()
                  : `0${new Date().getMonth()}`,
                2,
              ).getTime(),
            },
          },
        },
      ]);

      return books;
    } catch (error) {
      throw error;
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

      if (status === RETURNED) {
        const { bookId: bookInOrder } = existingOrder;

        await Book.updateOne(
          { _id: bookInOrder._id },
          { quantity: bookInOrder.quantity + existingOrder.quantity },
        );

        const updateOrder = await Order.findOneAndUpdate(
          { _id: existingOrder._id },
          {
            status: RETURNED,
          },
          { new: true },
        ).lean();

        await session.commitTransaction();
        return updateOrder;
      }

      // user change book
      if (bookInOrder._id.toString() !== newBookId.toString()) {
        const newBookUserChange = await Book.findOne({
          _id: newBookId,
        }).lean();
        if (!newBookUserChange)
          throw new ApiErrorHandler(404, "Book not found");
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
          {
            quantity:
              newBookUserChange.quantity -
              (bookQuantityUserChange || existingOrder.quantity),
          },
        );

        await session.commitTransaction();
        return await Order.findOneAndUpdate(
          { _id: orderId },
          updateData,
        ).lean();
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
      return await Order.updateOne({ _id: orderId }, updateData, {
        new: true,
      }).lean();
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
