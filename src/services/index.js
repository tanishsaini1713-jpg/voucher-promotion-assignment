function convertToDate(ddmmyyyy) {
  if (!ddmmyyyy) {
    return null;
  }

  if (ddmmyyyy instanceof Date) {
    return ddmmyyyy;
  }

  const [day, month, year] = ddmmyyyy.split("-");
  return new Date(year, month - 1, day);
}

function generateCode(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

function generateVoucherCode(length) {
  return generateCode(length);
}

function generatePromotionCode(length) {
  return generateCode(length);
}

function validateEnvConfig(names = []) {
  if (!Array.isArray(names) || names.length === 0) {
    return;
  }

  const missing = names.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(
      `Configuration missing environment variables: ${missing.join(", ")}`
    );
  }
}

module.exports = {
  convertToDate,
  generateVoucherCode,
  generatePromotionCode,
  validateEnvConfig,
};

