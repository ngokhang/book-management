import { response } from "../helpers/response.js";
import SearchServices from "../services/SearchServices.js";

const SearchController = {
  searchBook: async (req, res) => {
    const { q, page, limit, category, author } = req.query;

    return response(
      res,
      200,
      `Result for searching`,
      await SearchServices.searchBook({
        q,
        page,
        limit,
        category,
        author,
      }),
    );
  },
};

export default SearchController;
