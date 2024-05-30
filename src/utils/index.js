import bcrypt from "bcrypt";

export const utils = {
  checkExpires: (exp) => {
    const now = Math.floor(new Date() / 1000) || 0;
    return now > exp;
  },
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
  paginate: async (mode, query, options) => {
    const { _page, _limit } = query;
    const count = await mode.countDocuments().exec();
    const data = await mode
      .find()
      .skip((_page - 1) * _limit)
      .limit(_limit)
      .exec();
    const metadata = {
      total: count,
      _page,
      _limit,
      totalPages: Math.ceil(count / _limit),
    };

    return { metadata, data };
  },
};
