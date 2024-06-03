import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = () => {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB."))
    .catch((err) => {
      console.log("Failed to connect to MongoDB. Error: ", err.message);
    });
};
