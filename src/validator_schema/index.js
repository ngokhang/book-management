import auth from "./auth.js";
import book from "./book.js";
import category from "./category.js";
import order from "./order.js";
import user from "./user.js";
import search from "./search.js";
import analyst from "./analyst.js";

export const schemas = {
  user: { ...user },
  auth: { ...auth },
  category: { ...category },
  order: { ...order },
  book: { ...book },
  search: { ...search },
  analyst: { ...analyst },
};
