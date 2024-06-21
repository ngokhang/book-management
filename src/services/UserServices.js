import bcrypt from "bcrypt";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Order } from "../model/Order.js";
import { User } from "../model/UserSchema.js";

export const UserServices = {
  getAllUser: async ({ query: { _page, _limit } }) => {
    return await User.paginate({}, { page: _page, limit: _limit });
  },
  createUser: async (data) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error("User with this email already exists");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    return await User.create({ ...data, password: hashedPassword })
      .then((res) => res)
      .catch((err) => err);
  },
  getUserByCondition: async ({ _id }) => {
    try {
      const userExisting = await User.findOne({ _id });

      if (!userExisting) throw new ApiErrorHandler(404, "User not found");

      return userExisting;
    } catch (error) {
      throw error;
    }
  },
  delete: async (params) => {
    const user = await User.findOne({ ...params });
    if (!user) throw new Error("User invalid");

    return await User.deleteOne({ ...params })
      .exec()
      .then((res) => res)
      .catch((err) => err);
  },
  update: async ({ params: { id: _id }, body, role }) => {
    const user = await User.findOne({ _id });
    if (!user) throw new Error("User invalid");

    if (body.role && role !== "admin") {
      throw new ApiErrorHandler(403, "Forbidden");
    }

    return await User.updateOne({ _id }, body)
      .exec()
      .then((res) => res)
      .catch((err) => {
        throw err;
      });
  },
  getUserOrders: async ({ month, userId, page, limit }) => {
    try {
      const filter = {};
      const options = { page, limit };

      if (month) {
        let [startRange, endRange] = month;
        if (endRange && startRange > endRange)
          throw new ApiErrorHandler(400, "Invalid time range");
        if (!endRange || startRange === endRange) endRange = startRange;

        const startRangeTimestamp = new Date(2024, startRange - 1, 2).getTime();
        let endRangeTimestamp = new Date(2024, endRange, 1).getTime();

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
};
