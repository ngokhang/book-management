export default function getAccessToken(req) {
  const accessToken = req.header("authorization").split(" ")[1];
  return accessToken;
}
