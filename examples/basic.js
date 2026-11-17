
const {
  validateEnv,
  EnvValidationError
} = require("../src");

try {
  const config = validateEnv(
    {
      PORT: {
        type: "number",
        default: 3000
      },

      DATABASE_URL: {
        required: true,
        type: "url"
      },

      JWT_SECRET: {
        required: true,
        minLength: 20
      },

      DEBUG: {
        type: "boolean",
        default: false
      }
    },
    {
      env: {
        DATABASE_URL: "https://example.com/database",
        JWT_SECRET: "this-is-a-long-secret-key",
        DEBUG: "true"
      }
    }
  );

  console.log("Environment configuration is valid!");
  console.log(config);
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
