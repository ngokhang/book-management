import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

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
      ref: "Author",
    },
  ],
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
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
});

BookSchema.plugin(mongoosePaginate);

export const Book = mongoose.model("Book", BookSchema);
