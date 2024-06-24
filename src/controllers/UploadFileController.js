import { response } from "../helpers/response.js";
import { UploadFileServices } from "../services/UploadFileServices.js";
import "dotenv/config";

const UploadFileController = {
  uploadFileToDiskStorage: async (req, res) => {
    const { file } = req;

    return response(
      res,
      200,
      "Upload successfully",
      await UploadFileServices.uploadFileToDiskStorage({ file }),
    );
  },
  uploadToGoogleDrive: async (req, res, next) => {
    const { file } = req;
    const pathInLocal = await UploadFileServices.uploadFileToDiskStorage({
      file,
    });
    const filename = pathInLocal.split("/").reverse()[0];
    const mimetype = file.mimetype;

    return response(
      res,
      200,
      "Upload successfully",
      await UploadFileServices.uploadFileIntoGoogleDrive(
        filename,
        mimetype,
        pathInLocal,
      ),
    );
  },
};

export default UploadFileController;
