import mongoose from "mongoose";

const BookSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.Array,
    required: true,
  },
  categories: {
    type: mongoose.Schema.Types.Array,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  thumbnail: {
    type: String,
    required: true,
  },
  isBorrowed: {
    type: Boolean,
    require: true,
    default: true,
  },
});

export const Book = mongoose.model("Book", BookSchema);
