import mongoose from "mongoose";

const CategoriesSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

export const Categories = mongoose.model("Categories", CategoriesSchema);
