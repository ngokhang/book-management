import moment from "moment-timezone";
import mongoose from "mongoose";
import { BORROWED, RETURNED, TIMEZONE } from "../constants/index.js";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Book } from "../model/Book.js";
import { Order } from "../model/Order.js";
import getTimestampOfDate from "../utils/getTimestampOfDate.js";
import { User } from "../model/UserSchema.js";
import _ from "lodash";

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

  create: async ({
    userId,
    books,
    borrowDate,
    dueDate,
    status = BORROWED,
    totalPrice,
  }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const userInDB = await User.findOne({ _id: userId });
      if (!userInDB) throw new ApiErrorHandler(400, "User not existed");
      // calculate new quantity that user create new order
      const totalBooksInNewOrder = books.reduce(
        (acc, curr) => acc + curr.quantity,
        0,
      );
      // books in each orders of user has userId in Order table
      const listBookInOrderExistedByUserId = await Order.find({
        status: BORROWED,
        userId,
      });
      // calculate total book that user borrowed in this month
      const quantityBookOrderedInMonth = listBookInOrderExistedByUserId.reduce(
        (acc, curr) => {
          const books = curr.books;
          const totalBook = books.reduce((accBook, currBook) => {
            return currBook.quantity + accBook;
          }, 0);
          return acc + totalBook;
        },
        0,
      );
      // Check total book >= 5, if true throw error.
      if (quantityBookOrderedInMonth + totalBooksInNewOrder >= 6) {
        console.log(quantityBookOrderedInMonth, totalBooksInNewOrder);
        throw new ApiErrorHandler(
          400,
          `Some of books that you borrowed, that has not been paid.`,
        );
      }
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
      // group by _id of book when duplicate
      books = OrderServices.groupBooksDuplicateInOrder(books);

      // check totalPrice from frontend is correct
      let correctPrice = 0;
      correctPrice = await OrderServices.calculateTotalPriceInOrder(
        books,
        borrowDate,
        dueDate,
      );

      if (totalPrice !== correctPrice)
        throw new ApiErrorHandler(400, "Total price calculate is incorrect");

      let orderData = {
        userId,
        books,
        borrowDate,
        dueDate,
        status: BORROWED,
        totalPrice: totalPrice,
      };
      const newOrder = await Order.create(orderData);

      // Update quantity books in books
      await Promise.all(
        books.map(async ({ _id: bookId, quantity: bookQuantityOrder }) => {
          const bookInDB = await Book.findOne({ _id: bookId }).lean();
          await Book.updateOne(
            { _id: bookInDB._id },
            { quantity: bookInDB.quantity - bookQuantityOrder },
          );
        }),
      );

      await session.commitTransaction();
      return newOrder;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  update: async ({ updateData, orderId }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let { status, userId, books: newBooks } = updateData;
      const orderInDB = await Order.findOne({
        _id: orderId,
      });
      // Check order invalid
      if (!orderInDB) throw new ApiErrorHandler(400, "Order unavailable");
      const { books: booksInOrder } = orderInDB;
      // Check order returned
      if (orderInDB.status === RETURNED)
        throw new ApiErrorHandler(400, "This order has returned");
      // Check use case user return book
      if (status === RETURNED) {
        const updateOrder = await Order.findOneAndUpdate(
          { _id: orderId },
          { status: RETURNED },
          { new: true },
        );

        // Update the quantity of book in Book table
        await Promise.all(
          booksInOrder.map(
            async ({ _id: { _id }, quantity: quantityInOrder }) => {
              const bookInDB = await Book.findOne({ _id }).lean();
              await Book.updateOne(
                { _id },
                {
                  quantity: bookInDB.quantity + quantityInOrder,
                },
              );
            },
          ),
        );

        return updateOrder;
      }
      // Check use case user change book
      if (newBooks && newBooks.length > 0) {
        newBooks = OrderServices.groupBooksDuplicateInOrder(newBooks);
        updateData.books = newBooks;
        const booksInOrder = orderInDB.books;
        // process new books
        await Promise.all(
          newBooks.map(async ({ _id, quantity }) => {
            const bookInDB = await Book.findOne({ _id }).lean();
            if (!bookInDB)
              throw new ApiErrorHandler("Some of the books is available");
            await Book.updateOne(
              { _id: bookInDB._id },
              { quantity: bookInDB.quantity - quantity },
            );
          }),
        );
        // return books in old order
        await Promise.all(
          booksInOrder.map(async (book) => {
            const { _id, quantity: quantityBookInOrder } = book;
            const bookInDB = await Book.findOne({ _id }).lean();
            if (!bookInDB)
              throw new ApiErrorHandler(404, "Some of the book is not found");
            await Book.updateOne(
              { _id: bookInDB._id },
              { quantity: bookInDB.quantity + quantityBookInOrder },
            );
          }),
        );
      }
      const totalPriceOrder = await OrderServices.calculateTotalPriceInOrder(
        newBooks,
        updateData.borrowDate,
        updateData.dueDate,
      );

      const updateOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        { ...updateData, totalPrice: totalPriceOrder },
      );

      await session.commitTransaction();
      return updateOrder;
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

  calculateTotalPriceInOrder: async (booksOrder, borrowDate, dueDate) => {
    let totalPrice = 0;
    const distanceDay = moment(dueDate).tz(TIMEZONE).diff(borrowDate, "day");

    for await (const { _id: bookId, quantity: quantityOrder } of booksOrder) {
      const bookInDB = await Book.findOne({ _id: { $eq: bookId } }).lean();
      if (!bookInDB)
        throw new ApiErrorHandler(400, "Some one of books not existed");
      totalPrice += bookInDB.price * quantityOrder;
    }

    if (distanceDay > 7) totalPrice += totalPrice * 0.2;

    return totalPrice;
  },

  groupBooksDuplicateInOrder: (booksOrder) => {
    return booksOrder.reduce((acc, curr) => {
      const { _id: bookId, quantity: quantityOrder } = curr;
      const indexBookIdExisted = acc.findIndex((item) => item._id === bookId);

      if (indexBookIdExisted !== -1)
        acc[indexBookIdExisted].quantity += quantityOrder;
      else acc.push(curr);

      return acc;
    }, []);
  },
};
