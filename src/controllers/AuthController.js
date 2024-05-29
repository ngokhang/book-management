import { AuthServices } from "../services/AuthServices.js";

export const AuthController = {
  login: async (req, res, next) => {
    const { email, password } = req.body;
    const data = {
      email,
      password,
    };

    return await AuthServices.login(data).then((result) => {
      const { accessToken, refreshToken, userExisting: userData } = result;
      const { password, ...user } = userData.toObject();

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.json({
        message: "Login successful",
        user,
        accessToken,
      });
    });
  },
  register: async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const data = {
      firstName,
      lastName,
      email,
      password,
    };

    return await AuthServices.register(data)
      .then((result) => {
        return res.json({
          message: "User created successfully",
          data: result,
        });
      })
      .catch((err) => {
        next(err);
      });
  },
};
