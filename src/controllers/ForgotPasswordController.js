import "dotenv/config";
import { response } from "../helpers/response.js";
import ForgotPasswordServices from "../services/ForgotPasswordServices.js";

const ForgotPasswordController = {
  sendRequestReset: async (req, res) => {
    const { email } = req.body;

    return response(
      res,
      200,
      "Send request reset successfully",
      await ForgotPasswordServices.createResetToken({ email }),
    );
  },

  setNewPassword: async (req, res) => {
    const { resetToken, newPass } = req.body;

    return response(
      res,
      200,
      "Updated password",
      await ForgotPasswordServices.resetPassword({ resetToken, newPass }),
    );
  },
};

export default ForgotPasswordController;
