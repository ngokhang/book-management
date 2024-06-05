import mongoose, { Schema } from "mongoose";

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
);

export const Author = mongoose.model("author", AuthorSchema);
