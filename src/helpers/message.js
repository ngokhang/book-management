import { CONFLICT, FAILED, NOT_FOUND, SUCCESS } from "../constants/index.js";

export default function message(action, obj, status = 200) {
  switch (status) {
    case 200:
      return `${action} ${obj} ${SUCCESS}`;

    case 201:
      return `${action} ${obj} ${SUCCESS}`;

    case 204:
      return `${action} ${obj} ${SUCCESS}`;

    case 400:
      return `${action} ${obj} ${FAILED}`;

    case 404:
      return `${obj} ${NOT_FOUND}`;

    case 409:
      return `${obj} ${CONFLICT}`;

    case 500:
      return `${obj} ${FAILED}`;

    default:
      break;
  }
}
