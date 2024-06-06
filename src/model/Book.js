import mongoose, { Schema } from "mongoose";
import autopopulate from "mongoose-autopopulate";
import paginatePlugin from "./plugins/paginate.js";

const BookSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
        autopopulate: true,
      },
    ],
    description: {
      type: String,
      trim: true,
      default: "",
    },
    thumbnail: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
)
  .plugin(autopopulate)
  .plugin(paginatePlugin);

export const Book = mongoose.model("Book", BookSchema);
