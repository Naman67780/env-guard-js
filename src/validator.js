
const { validateType, validateMinLength } = require("./rules");
const { EnvValidationError } = require("./errors");

const SUPPORTED_TYPES = [
  "string",
  "number",
  "boolean",
  "url",
  "email"
];

function validateEnv(schema, options = {}) {
  if (
    schema === null ||
    typeof schema !== "object" ||
    Array.isArray(schema)
  ) {
    throw new TypeError("Schema must be an object");
  }

  if (
    options === null ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    throw new TypeError("Options must be an object");
  }

  const env = options.env === undefined ? process.env : options.env;

  if (env === null || typeof env !== "object" || Array.isArray(env)) {
    throw new TypeError("Options env must be an object");
  }

  const config = {};
  const errors = [];

  for (const [key, rules] of Object.entries(schema)) {
    if (
      rules === null ||
      typeof rules !== "object" ||
      Array.isArray(rules)
    ) {
      errors.push(`${key} must have a valid rules object`);
      continue;
    }

    const allowedRules = [
      "required",
      "type",
      "default",
      "minLength",
      "validate"
    ];

    for (const rule of Object.keys(rules)) {
      if (!allowedRules.includes(rule)) {
        errors.push(`${key} has unsupported rule: ${rule}`);
      }
    }

    if (
      rules.required !== undefined &&
      typeof rules.required !== "boolean"
    ) {
      errors.push(`${key} required rule must be a boolean`);
    }

    if (
      rules.type !== undefined &&
      !SUPPORTED_TYPES.includes(rules.type)
    ) {
      errors.push(`${key} has unsupported type: ${rules.type}`);
      continue;
    }

    if (
      rules.minLength !== undefined &&
      (!Number.isInteger(rules.minLength) || rules.minLength < 0)
    ) {
      errors.push(`${key} minLength must be a non-negative integer`);
      continue;
    }

    if (
      rules.validate !== undefined &&
      typeof rules.validate !== "function"
    ) {
      errors.push(`${key} validate rule must be a function`);
      continue;
    }

    let value = env[key];

    if (
      (value === undefined || value === "") &&
      rules.default !== undefined
    ) {
      value = String(rules.default);
    }

    if (value === undefined || value === "") {
      if (rules.required) {
        errors.push(`${key} is required`);
      }

      continue;
    }

    if (typeof value !== "string") {
      errors.push(`${key} must be a string environment value`);
      continue;
    }

    if (rules.type) {
      if (!validateType(value, rules.type)) {
        errors.push(`${key} must be a valid ${rules.type}`);
        continue;
      }
    }

    if (rules.minLength !== undefined) {
      if (!validateMinLength(value, rules.minLength)) {
        errors.push(
          `${key} must be at least ${rules.minLength} characters long`
        );
        continue;
      }
    }

    if (rules.validate !== undefined) {
      try {
        const result = rules.validate(value);

        if (result !== true) {
          if (typeof result === "string" && result.trim() !== "") {
            errors.push(`${key} ${result}`);
          } else {
            errors.push(`${key} failed custom validation`);
          }

          continue;
        }
      } catch (error) {
        errors.push(
          `${key} custom validation failed: ${error.message}`
        );
        continue;
      }
    }

    if (rules.type === "number") {
      value = Number(value);
    } else if (rules.type === "boolean") {
      value = value.toLowerCase() === "true";
    }

    config[key] = value;
  }

  if (errors.length > 0) {
    throw new EnvValidationError(errors);
  }

  return config;
}

module.exports = {
  validateEnv
};
