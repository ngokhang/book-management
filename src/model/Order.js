import mongoose, { Schema } from "mongoose";
import { BORROWED, RETURNED, PENDING } from "../constants/index.js";
import autopopulate from "mongoose-autopopulate";
import paginatePlugin from "./plugins/paginate.js";

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
      autopopulate: true,
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
)
  .plugin(autopopulate)
  .plugin(paginatePlugin);

export const Order = mongoose.model("Order", OrderSchema);
