import "dotenv/config";
import { google } from "googleapis";
import fs from "fs";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";

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

  uploadFile: async (
    filename = "Untitled",
    mimetype = "image/png",
    pathInLocal,
    filePublic = false,
  ) => {
    try {
      const res = await driver.files.create({
        requestBody: {
          name: filename,
          mimeType: mimetype,
          parents: ["1yH4qR8DCtx3Pyzz2PICjc1QT1Kt8h9I2"],
        },
        media: {
          mimeType: mimetype,
          body: fs.createReadStream(pathInLocal),
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
      throw new ApiErrorHandler(500, "Error when upload file");
    }
  },
  deleteFile: async ({ fileId }) => {
    try {
      const res = await driver.files.delete({
        fileId,
      });

      return res.data;
    } catch (error) {
      throw new ApiErrorHandler(500, "Error when delete file");
    }
  },
};
