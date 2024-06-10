import { response } from "../helpers/response.js";
import { UploadFileServices } from "../services/UploadFileServices.js";

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
};

export default UploadFileController;
