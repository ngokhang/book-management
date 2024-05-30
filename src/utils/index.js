import bcrypt from "bcrypt";

export const utils = {
  checkExpires: (exp) => {
    const now = Math.floor(new Date() / 1000) || 0;
    return now > exp;
  },
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
};
