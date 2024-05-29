export const JwtServices = {
  sign: async (data, secret, expiresIn) => {
    return await jwt.sign(data, secret, { expiresIn });
  },
  verify: async (token, secret) => {
    return await jwt.verify(token, secret);
  },
  decode: async (token) => {
    return await jwt.decode(token);
  },
};
