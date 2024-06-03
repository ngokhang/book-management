import express from "express";
import { connectDB } from "./src/configs/database.js";
import bodyParser from "body-parser";
import morgan from "morgan";
import compression from "compression";
import { router } from "./src/router/index.js";
import { ErrorHandlerMiddleware } from "./src/middlewares/ErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 8080;

connectDB();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());

app.use(cors());
app.use("/api", router);
app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
