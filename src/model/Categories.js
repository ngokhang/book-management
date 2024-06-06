import mongoose, { Schema } from "mongoose";
import paginatePlugin from "./plugins/paginate.js";

const CategoriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
).plugin(paginatePlugin);

CategoriesSchema.index({ name: 1 }, { unique: true });

export const Categories = mongoose.model("Categories", CategoriesSchema);
