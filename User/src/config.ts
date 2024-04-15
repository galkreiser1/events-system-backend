const API_KEY = process.env.API_KEY;

export const config = {
  API_KEY_HEADER: {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  },
};
