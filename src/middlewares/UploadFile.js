import multer from "multer";
import ApiErrorHandler from "./ApiErrorHandler.js";

export default function UploadFile(fieldName) {
  return (req, res, next) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, process.cwd() + "/src/uploads/");
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
      },
    });
    const upload = multer({ storage }).single(fieldName);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        throw new ApiErrorHandler(400, err.message);
      } else if (err) {
        // An unknown error occurred when uploading.
        throw new ApiErrorHandler(500, err.message);
      }
    });

    next();
  };
}
