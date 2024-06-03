import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";
import { BORROWED, RETURNED, PENDING } from "../constants/index.js";

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowDate: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    dueDate: {
      type: Schema.Types.Date,
      required: true,
    },
    status: {
      type: String,
      enum: [BORROWED, RETURNED, PENDING],
      default: BORROWED,
    },
  },
  {
    timestamps: true,
    collection: "order",
  },
);

OrderSchema.plugin(mongoosePaginate);

export const Order = mongoose.model("Order", OrderSchema);
