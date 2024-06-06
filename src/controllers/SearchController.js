import SearchServices from "../services/SearchServices.js";
import { response } from "../helpers/response.js";

const SearchController = {
  searchBook: async (req, res) => {
    return response(
      res,
      200,
      "Search book success",
      await SearchServices.searchBook(req),
    );
  },
};

export default SearchController;
