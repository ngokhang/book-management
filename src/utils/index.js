import bcrypt from "bcrypt";
import fs from "fs";
import moment from "moment-timezone";

export const utils = {
  checkExpires: (exp) => {
    const now = Math.floor(new Date() / 1000) || 0;
    return now > exp;
  },
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
  generateKeyRandom: (length) => {
    if (length < 1) return "";

    const lettersAndDigits =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const specialCharacters = "!@#$%^&*()_+[]{}|;:,.<>?";

    // Ensure the string has at least one special character
    let result = [
      specialCharacters[Math.floor(Math.random() * specialCharacters.length)],
    ];

    // Fill the rest of the string with random letters and digits
    for (let i = 1; i < length; i++) {
      result.push(
        lettersAndDigits[Math.floor(Math.random() * lettersAndDigits.length)],
      );
    }

    // Shuffle the result to ensure the special character isn't always in the same position
    result = result.sort(() => Math.random() - 0.5);

    // Join the array into a single string
    return result.join("");
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
