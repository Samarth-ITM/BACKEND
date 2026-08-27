function handleDbResult({ data, error }) {
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

module.exports = handleDbResult;
