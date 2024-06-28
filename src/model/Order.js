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
    books: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Book",
          required: true,
          autopopulate: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
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
    totalPrice: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Number,
      default: new Date().getTime(),
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
