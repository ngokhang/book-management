import mongoose, { Schema } from "mongoose";
import paginatePlugin from "./plugins/paginate.js";

const CategoriesSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
});

CategoriesSchema.plugin(paginatePlugin);
CategoriesSchema.index({ name: 1 }, { unique: true });

export const Categories = mongoose.model("Categories", CategoriesSchema);
