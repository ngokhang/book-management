import ApiErrorHandler from "../middlewares/ApiErrorHandler.js";
import { Author } from "../model/Author.js";

const AuthorServices = {
  getAll: async ({ query: { _page, _limit } }) => {
    try {
      return await Author.paginate({}, { page: _page, limit: _limit });
    } catch (error) {
      throw new ApiErrorHandler(500, error.message);
    }
  },
  get: async (req) => {
    try {
      const { id } = req.params;
      const author = await Author.findById(id);

      if (!author) throw new ApiErrorHandler(404, "Author not found");

      return author;
    } catch (error) {
      throw error;
    }
  },
  create: async ({ body }) => {
    try {
      const newAuthor = await Author.create(body);
      return newAuthor;
    } catch (error) {
      throw error;
    }
  },
  update: async ({ params: { id }, body }) => {
    try {
      const response = await Author.findByIdAndUpdate(id, body, {
        new: true,
      });

      if (!response) throw new ApiErrorHandler(404, "Author not found");

      return response;
    } catch (error) {
      throw error;
    }
  },
  delete: async ({ body: { arrIds } }) => {
    try {
      // Check if arrIds is empty
      if (arrIds.length === 0)
        throw new ApiErrorHandler(400, "Please provide author id(s) to delete");

      // Check if author id(s) is/are exist
      const authorExisting = await Author.countDocuments({
        _id: { $in: arrIds },
      });

      if (authorExisting !== arrIds.length)
        throw new ApiErrorHandler(404, "Some author not found");
      if (authorExisting === 0)
        throw new ApiErrorHandler(404, "No author found");

      // Delete author
      const response = await Author.deleteMany({ _id: { $in: arrIds } });

      if (!response) throw new ApiErrorHandler(400, "Delete author failed");

      return response;
    } catch (error) {
      throw error;
    }
  },
  deleteAll: async () => {
    try {
      if ((await Author.countDocuments()) === 0)
        throw new ApiErrorHandler(404, "No author found");

      return await Author.deleteMany();
    } catch (error) {
      throw error;
    }
  },
};

export default AuthorServices;
