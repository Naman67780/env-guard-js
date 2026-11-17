
function validateType(value, type) {
  switch (type) {
    case "string":
      return typeof value === "string";

    case "number":
      return value.trim() !== "" && Number.isFinite(Number(value));

    case "boolean":
      return ["true", "false"].includes(value.toLowerCase());

    case "url":
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }

    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    default:
      throw new Error(`Unsupported validation type: ${type}`);
  }
}

function validateMinLength(value, minLength) {
  return value.length >= minLength;
}

module.exports = {
  validateType,
  validateMinLength
};
