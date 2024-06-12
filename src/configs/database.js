import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = () => {
  mongoose
    .connect(process.env.DB_URI_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB."))
    .catch((err) => {
      console.log("Failed to connect to MongoDB. Error: ", err.message);
    });
};
