function handleDuplicateKey(res, error, entityName = "Record") {
  if (error && error.code === 11000) {
    const duplicatedField = Object.keys(error.keyValue || {})[0] || "value";
    return res.status(409).json({
      message: `${entityName} with this ${duplicatedField} already exists.`,
    });
  }
  return false;
}

module.exports = {
  handleDuplicateKey,
};

