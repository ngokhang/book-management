import moment from "moment";
import { ObjectId } from "mongodb";
import { BORROWED, PENDING } from "../constants/index.js";
import getUserDataFromToken from "../helpers/getUserDataFromToken.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Order } from "../model/Order.js";

export const OrderServices = {
  getAll: async (req) => {
    const { _page, _limit } = req;
    const { role, _id } = getUserDataFromToken(req);

    const aggregate = Order.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $lookup: {
          from: "authors",
          localField: "bookInfo.author",
          foreignField: "_id",
          as: "bookInfo.author",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $unwind: "$bookInfo",
      },
      {
        $match: {
          "userInfo._id":
            role === "admin"
              ? { $ne: ObjectId.createFromHexString(_id) }
              : ObjectId.createFromHexString(_id),
        },
      },
      {
        $project: {
          _id: 1,
          borrowDate: 1,
          dueDate: 1,
          status: 1,
          bookInfo: {
            name: 1,
            categories: 1,
            author: 1,
          },
          userInfo: {
            _id: 1,
          },
        },
      },
    ]);

    return await Order.aggregatePaginate(aggregate, {
      page: _page,
      limit: _limit,
    })
      .then((result) => result)
      .catch((err) => {
        throw err;
      });
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
};
