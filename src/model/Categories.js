import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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

CategoriesSchema.plugin(mongoosePaginate);
CategoriesSchema.index({ name: 1 }, { unique: true });

export const Categories = mongoose.model("Categories", CategoriesSchema);
