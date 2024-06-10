import mongoose, { Schema } from "mongoose";
import autopopulate from "mongoose-autopopulate";
import { BORROWED, RETURNED } from "../constants/index.js";
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
      type: Number,
      default: new Date().getTime(),
    },
    dueDate: {
      type: Number,
      required: new Date().getTime(),
    },
    status: {
      type: String,
      enum: [BORROWED, RETURNED],
      default: BORROWED,
    },
    createdAt: {
      type: Number,
      default: new Date().getTime(),
    },
    quantity: {
      type: Number,
      default: 1,
    },
    updatedAt: {
      type: Number,
      default: new Date().getTime(),
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
