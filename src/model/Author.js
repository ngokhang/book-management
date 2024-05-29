import mongoose from "mongoose";

const AuthorSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});
