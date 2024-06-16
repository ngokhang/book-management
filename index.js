import express from "express";
import { connectDB } from "./src/configs/database.js";
import bodyParser from "body-parser";
import morgan from "morgan";
import compression from "compression";
import { router } from "./src/router/index.js";
import { ErrorHandlerMiddleware } from "./src/middlewares/ErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();

const PORT = process.env.PORT || 8080;

connectDB();

app.set("views", path.join("./src", "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, type: "application/json" }));
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());

app.use(cors());
app.use("/src/uploads", express.static("src/uploads"));
app.use("/api", router);
app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
