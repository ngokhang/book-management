import moment from "moment";
import { TIMEZONE } from "../constants/index.js";

export default function getTimestampOfDate(day, month, year) {
  return moment(new Date(year, month - 1, day))
    .add(7, "hours")
    .tz(TIMEZONE)
    .valueOf();
}
