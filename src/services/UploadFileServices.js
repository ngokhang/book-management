import "dotenv/config";
import { google } from "googleapis";
import fs from "fs";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import "dotenv/config";
import path from "path";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const driver = google.drive({
  version: "v3",
  auth: oauth2Client,
});

export const UploadFileServices = {
  setFilePublic: async (fileId) => {
    try {
      await driver.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (error) {
      throw error;
    }
  },

  uploadFileIntoGoogleDrive: async (
    filename = "default",
    mimetype = "image/png",
    pathInLocal,
    filePublic = false,
  ) => {
    console.log(">>> ", process.cwd() + "/src/uploads/" + filename);
    try {
      const res = await driver.files.create({
        requestBody: {
          name: filename,
          mimeType: mimetype,
          parents: [process.env.PARENT_FOLDER_ID],
        },
        media: {
          mimeType: mimetype,
          body: fs.createReadStream(process.cwd() + "/src/uploads/" + filename),
        },
      });

      if (filePublic) await UploadFileServices.setFilePublic(res.data.id);

      const {
        data: { thumbnailLink, webViewLink, webContentLink },
      } = await driver.files.get({
        fileId: res.data.id,
        fields: "thumbnailLink, webViewLink, webContentLink",
      });

      return { ...res.data, thumbnailLink, webViewLink, webContentLink };
    } catch (error) {
      console.error(error);
      throw new ApiErrorHandler(500, "Error when upload file");
    }
  },
  deleteFileOnGoogleDrive: async ({ fileId }) => {
    try {
      const res = await driver.files.delete({
        fileId,
      });

      return res.data;
    } catch (error) {
      throw new ApiErrorHandler(500, "Error when delete file");
    }
  },

  uploadFileToDiskStorage: async ({ file }) => {
    try {
      const extensionAllow = [".png", ".jpg", ".jpeg"];
      if (!extensionAllow.includes(path.extname(file.originalname)))
        throw new ApiErrorHandler(
          422,
          "Invalid image, only allowed : .png, .jpg, .jpeg",
        );
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = uniqueSuffix + "-" + file.originalname;
      const pathStorage = process.cwd() + "/src/uploads/" + fileName;
      fs.writeFileSync(pathStorage, file.buffer);
      const pathFinal =
        process.env.DEVELOP_MODE === "true"
          ? `${process.env.DOMAIN_DEV}/src/uploads/${fileName}`
          : `${process.env.DOMAIN_PRODUCT}/src/uploads/${fileName}`;
      return pathFinal;
    } catch (error) {
      throw error;
    }
  },
};
