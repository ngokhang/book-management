import mongoose, { Schema } from "mongoose";
import paginatePlugin from "./plugins/paginate.js";

const AuthorSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  },
).plugin(paginatePlugin);

export const Author = mongoose.model("author", AuthorSchema);
