import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = () => {
  mongoose
    .connect(
      process.env.DEVELOP_MODE === "true"
        ? process.env.DB_URI_LOCAL
        : process.env.DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )
    .then(() =>
      console.log(
        `Connected to MongoDB. ${
          process.env.DEVELOP_MODE === "true"
            ? process.env.DB_URI_LOCAL
            : process.env.DB_URI
        }`,
      ),
    )
    .catch((err) => {
      console.log("Failed to connect to MongoDB. Error: ", err.message);
    });
};
