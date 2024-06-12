export default function getTimestampOfDate(day, month, year) {
  return new Date(year, month, day, 0).getTime();
}
