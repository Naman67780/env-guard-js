
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateEnv,
  EnvValidationError
} = require("../src");

test("validates a number and applies a default value", () => {
  const config = validateEnv(
    {
      PORT: {
        type: "number",
        default: 3000
      }
    },
    {
      env: {}
    }
  );

  assert.deepEqual(config, {
    PORT: 3000
  });
});

test("converts valid number environment variables", () => {
  const config = validateEnv(
    {
      PORT: {
        type: "number",
        required: true
      }
    },
    {
      env: {
        PORT: "5000"
      }
    }
  );

  assert.equal(config.PORT, 5000);
});

test("throws an error when a required variable is missing", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          DATABASE_URL: {
            required: true
          }
        },
        {
          env: {}
        }
      );
    },
    {
      name: "EnvValidationError",
      message: /DATABASE_URL is required/
    }
  );
});

test("rejects an invalid number", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          PORT: {
            type: "number"
          }
        },
        {
          env: {
            PORT: "abc"
          }
        }
      );
    },
    /PORT must be a valid number/
  );
});

test("converts boolean environment variables", () => {
  const config = validateEnv(
    {
      DEBUG: {
        type: "boolean"
      }
    },
    {
      env: {
        DEBUG: "true"
      }
    }
  );

  assert.equal(config.DEBUG, true);
});

test("rejects an invalid boolean", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          DEBUG: {
            type: "boolean"
          }
        },
        {
          env: {
            DEBUG: "yes"
          }
        }
      );
    },
    /DEBUG must be a valid boolean/
  );
});

test("accepts a valid URL", () => {
  const config = validateEnv(
    {
      DATABASE_URL: {
        type: "url"
      }
    },
    {
      env: {
        DATABASE_URL: "https://example.com"
      }
    }
  );

  assert.equal(config.DATABASE_URL, "https://example.com");
});

test("rejects an invalid email", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          ADMIN_EMAIL: {
            type: "email"
          }
        },
        {
          env: {
            ADMIN_EMAIL: "not-an-email"
          }
        }
      );
    },
    /ADMIN_EMAIL must be a valid email/
  );
});

test("checks minimum string length", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          JWT_SECRET: {
            minLength: 20
          }
        },
        {
          env: {
            JWT_SECRET: "short"
          }
        }
      );
    },
    /JWT_SECRET must be at least 20 characters long/
  );
});

test("collects multiple validation errors", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          DATABASE_URL: {
            required: true
          },
          PORT: {
            type: "number"
          }
        },
        {
          env: {
            PORT: "abc"
          }
        }
      );
    },
    (error) => {
      assert.ok(error instanceof EnvValidationError);
      assert.equal(error.errors.length, 2);
      assert.match(error.message, /DATABASE_URL is required/);
      assert.match(error.message, /PORT must be a valid number/);

      return true;
    }
  );
});

test("accepts a value that passes custom validation", () => {
  const config = validateEnv(
    {
      API_KEY: {
        required: true,
        validate: (value) => value.startsWith("sk_") || "must start with sk_"
      }
    },
    {
      env: {
        API_KEY: "sk_123456"
      }
    }
  );

  assert.equal(config.API_KEY, "sk_123456");
});

test("rejects a value that fails custom validation", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          API_KEY: {
            required: true,
            validate: (value) => value.startsWith("sk_") || "must start with sk_"
          }
        },
        {
          env: {
            API_KEY: "invalid_key"
          }
        }
      );
    },
    /API_KEY must start with sk_/
  );
});

test("handles errors thrown by custom validators", () => {
  assert.throws(
    () => {
      validateEnv(
        {
          API_KEY: {
            validate: () => {
              throw new Error("custom check crashed");
            }
          }
        },
        {
          env: {
            API_KEY: "some-value"
          }
        }
      );
    },
    /API_KEY custom validation failed: custom check crashed/
  );
});


test("rejects a null schema", () => {
  assert.throws(
    () => validateEnv(null),
    {
      name: "TypeError",
      message: "Schema must be an object"
    }
  );
});

test("rejects an array as a schema", () => {
  assert.throws(
    () => validateEnv([]),
    /Schema must be an object/
  );
});

test("rejects an invalid environment object", () => {
  assert.throws(
    () => validateEnv(
      { PORT: { type: "number" } },
      { env: null }
    ),
    /Options env must be an object/
  );
});

test("rejects unsupported validation types", () => {
  assert.throws(
    () => validateEnv(
      { PORT: { type: "integer" } },
      { env: { PORT: "3000" } }
    ),
    /PORT has unsupported type: integer/
  );
});

test("rejects invalid minimum length rules", () => {
  assert.throws(
    () => validateEnv(
      { SECRET: { minLength: -5 } },
      { env: { SECRET: "hello" } }
    ),
    /SECRET minLength must be a non-negative integer/
  );
});

test("rejects a non-function custom validator", () => {
  assert.throws(
    () => validateEnv(
      { SECRET: { validate: "yes" } },
      { env: { SECRET: "hello" } }
    ),
    /SECRET validate rule must be a function/
  );
});

test("rejects unsupported schema rules", () => {
  assert.throws(
    () => validateEnv(
      { PORT: { unknownRule: true } },
      { env: { PORT: "3000" } }
    ),
    /PORT has unsupported rule: unknownRule/
  );
});

test("rejects non-string environment values", () => {
  assert.throws(
    () => validateEnv(
      { PORT: { type: "number" } },
      { env: { PORT: 3000 } }
    ),
    /PORT must be a string environment value/
  );
});
