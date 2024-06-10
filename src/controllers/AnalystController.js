import { response } from "../helpers/response.js";
import AnalystServices from "../services/AnalystServices.js";

const AnalystController = {
  getOrder: async (req, res) => {
    const { month, userId, page, limit } = req.query;

    return response(
      res,
      200,
      "Reporting orders",
      await AnalystServices.getOrder({ month, userId, page, limit }),
    );
  },

  getMostBorrowedBooksDescending: async (req, res) => {
    return response(
      res,
      200,
      "Reporting books",
      await AnalystServices.getMostBorrowedBooksDescending(),
    );
  },
};

export default AnalystController;
