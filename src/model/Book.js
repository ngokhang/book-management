import mongoose, { Schema } from "mongoose";
import paginatePlugin from "./plugins/paginate.js";
import autopopulate from "mongoose-autopopulate";
import searchPlugin from "./plugins/search.js";

const BookSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  author: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "author",
      autopopulate: true,
    },
  ],
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
    required: true,
  },
})
  .plugin(autopopulate)
  .plugin(paginatePlugin)
  .plugin(searchPlugin, { fields: ["name", "categories", "author"] });

export const Book = mongoose.model("Book", BookSchema);
