import moment from "moment";
import { ObjectId } from "mongodb";
import { BORROWED, PENDING, RETURNED } from "../constants/index.js";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Order } from "../model/Order.js";
import { Author } from "../model/Author.js";
import { Categories } from "../model/Categories.js";

export const OrderServices = {
  getAll: async (req) => {
    const { _page, _limit } = req;
    const { role, _id } = getUserDataFromToken(req);

    const options = {
      page: _page,
      limit: _limit,
      populate: {
        path: "bookId",
        populate: {
          path: "author",
          model: Author,
        },
        populate: {
          path: "categories",
          model: Categories,
        },
      },
    };

    const aggregate = await Order.aggregate([
      {
        $match: {},
      },
    ]);

    await Order.populate(aggregate, options.populate);

    switch (role) {
      case "user":
        return await Order.aggregatePaginate(
          [{ $match: { userId: ObjectId.createFromHexString(_id) } }],
          options,
        )
          .then((result) => result)
          .catch((err) => {
            throw err;
          });
      default:
        return await Order.aggregatePaginate(aggregate, options)
          .then((result) => result)
          .catch((err) => {
            throw err;
          });
    }
  },

  create: async ({
    userId,
    bookId,
    borrowDate,
    dueDate,
    status = BORROWED,
  }) => {
    const userBorrowedOrder = await Order.findOne({
      userId: userId,
      status: BORROWED,
    }).lean();
    if (userBorrowedOrder) {
      throw new ApiErrorHandler(409, "User has borrowed a book");
    }
    const orderData = {
      userId,
      bookId,
      dueDate,
      borrowDate,
      status,
    };
    const newBorrowDate = moment(borrowDate);
    const newDueDate = moment(dueDate);
    const countDayBorrow = newDueDate.diff(newBorrowDate, "days");

    if (countDayBorrow > 7) {
      throw new ApiErrorHandler(400, "Only 7 days allowed to borrow a book");
    }
    if (newBorrowDate.isBefore(moment()))
      throw new ApiErrorHandler(400, "Borrow date must be in the future");

    const orderExisting = await Order.find({
      bookId,
    })
      .sort("createdAt")
      .lean();
    const borrowedOrderList = orderExisting.filter(
      (order) => order.status === BORROWED,
    );
    const pendingOrderList = orderExisting.filter(
      (order) => order.status === PENDING,
    );

    if (borrowedOrderList.length === 0 && pendingOrderList.length === 0) {
      return await Order.create(orderData)
        .then((result) => result)
        .catch((err) => {
          throw err;
        });
    }

    const lastBorrowedOrder = borrowedOrderList[borrowedOrderList.length - 1];
    const lastBorrowedOrderDueDate = moment(lastBorrowedOrder.dueDate);

    // Check if the book is available to borrow
    if (
      newBorrowDate.isBefore(lastBorrowedOrderDueDate) &&
      pendingOrderList.length > 0
    ) {
      throw new ApiErrorHandler(409, "Book is not available");
    }

    // Process the new order if the last borrowed order is not returned
    if (lastBorrowedOrder.status === BORROWED) {
      if (
        pendingOrderList.length === 0 &&
        newBorrowDate.isAfter(moment(lastBorrowedOrder.dueDate))
      ) {
        return await Order.create({ ...orderData, status: PENDING })
          .then((result) => result)
          .catch((err) => {
            throw err;
          });
      }
      pendingOrderList.forEach((order) => {
        if (newBorrowDate.isAfter(moment(order.borrowDate))) {
          throw new ApiErrorHandler(409, "Book is not available");
        }
      });

      throw new ApiErrorHandler(409, "Book is not available");
    }
  },

  update: async (req) => {
    const { status, userId, bookId, borrowDate, _id: orderId } = req.body;
    const { _id, role } = getUserDataFromToken(req);

    switch (role) {
      case "user":
        // Prevent user from updating other user's order
        if (_id.toString() !== userId.toString())
          throw new ApiErrorHandler(403, "Forbidden");
        break;

      default:
        break;
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        bookId,
        borrowDate,
      },
      { status },
      { new: true },
    );

    if (!order) throw new ApiErrorHandler(404, "Order not found");

    return order;
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
