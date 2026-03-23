export const requireFields = (payload, fields) => {
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      const error = new Error(`${field} is required`);
      error.statusCode = 400;
      throw error;
    }
  }
};
