import bcrypt from "bcrypt";
import fs from "fs";

export const utils = {
  checkExpires: (exp) => {
    const now = Math.floor(new Date() / 1000) || 0;
    return now > exp;
  },
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  asyncHandler: (fn) => (req, res, next) => {
    fn(req, res, next).catch(next); // next là một hàm callback của ExpressJS
  },

  storageThumbnail: (files, obj) => {
    if (files.thumbnail) {
      const image = files.thumbnail[0];
      const fileName = `${Date.now()}-${image.originalname}`;
      const path = process.cwd() + "/src/uploads/" + fileName;

      fs.writeFileSync(path, image.buffer);

      obj.thumbnail = process.env.DEVELOP_MODE
        ? `${process.env.DOMAIN_DEV}/src/uploads/${fileName}`
        : `${process.env.DOMAIN_PROD}/src/uploads/${fileName}`;
      return true;
    }
    return false;
  },
};
