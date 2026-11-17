
class EnvValidationError extends Error {
  constructor(errors) {
    const message = [
      "Environment validation failed:",
      ...errors.map((error) => `- ${error}`)
    ].join("\n");

    super(message);

    this.name = "EnvValidationError";
    this.errors = errors;
  }
}

module.exports = {
  EnvValidationError
};
