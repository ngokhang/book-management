import { RESET_PASSWORD_TOKEN, TIMEZONE } from "../constants/index.js";
import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Token } from "../model/token.js";
import { User } from "../model/UserSchema.js";
import { utils } from "../utils/index.js";
import bcrypt from "bcrypt";
import transporter from "../configs/mail.js";
import ejs from "ejs";
import MailServices from "./MailServices.js";
import moment from "moment";

const ForgotPasswordServices = {
  createResetToken: async ({ email }) => {
    try {
      const userInDB = await User.findOne({ email }).lean();
      if (!userInDB) throw new ApiErrorHandler(404, "Email not found");

      const resetToken = await Token.create({
        value: utils.generateKeyRandom(6),
        typeToken: RESET_PASSWORD_TOKEN,
        user: userInDB._id,
        expiresAt: moment().tz(TIMEZONE).add(2, "minute").valueOf(),
      });

      ejs.renderFile(
        process.cwd() + "/src/views/mail.ejs",
        { resetToken, fullName: `${userInDB.firstName} ${userInDB.lastName}` },
        async function (error, data) {
          if (error) {
            throw new ApiErrorHandler(400, error.message);
          } else {
            const optionsSendmail = {
              from: process.env.EMAIL, // sender address
              to: email, // receiver email
              subject: "Book Management mail for resetting password", // Subject line
              html: data,
            };
            await MailServices.sendMail(transporter, optionsSendmail);
          }
        },
      );

      return { message: "Sent reset token" };
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async ({ resetToken, newPass }) => {
    try {
      const resetTokenInDB = await Token.findOne({ value: resetToken }).lean();
      console.log(moment().tz(TIMEZONE).valueOf());
      if (!resetTokenInDB) throw new ApiErrorHandler(404, "Token invalid");
      if (resetTokenInDB.expiresAt < moment().tz(TIMEZONE).valueOf()) {
        await Token.deleteOne({ value: resetToken });
        throw new ApiErrorHandler(400, "Token expired");
      }
      if (!resetTokenInDB)
        throw new ApiErrorHandler(400, "Invalid reset token");

      const { user } = resetTokenInDB;
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(newPass, salt);

      const updatePassword = await User.findOneAndUpdate(
        { _id: user._id },
        { password: newHashPassword },
      ).then(async (res) => await Token.deleteOne({ _id: resetTokenInDB._id }));

      return { message: "Reset password successfully" };
    } catch (error) {
      throw error;
    }
  },
};

export default ForgotPasswordServices;
