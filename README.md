
# env-guard-js

A lightweight environment variable validation library for Node.js.

Validate environment variables before your application starts. Supports required variables, default values, type checking, custom validation, and detailed error reporting.

## Features

- Required environment variable validation
- Default values
- String, number, and boolean validation
- URL and email validation
- Minimum string length validation
- Custom validation functions
- Multiple validation errors reported together
- Custom environment objects for testing
- No external runtime dependencies

## Installation

```bash
npm install env-guard-js
```

## Quick Start

```javascript
const { validateEnv } = require("env-guard-js");

const config = validateEnv({
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
});

console.log(config);
```

## Supported Validation Rules

| Rule | Description |
|---|---|
| required | Requires the variable to be present |
| type | Validates the variable's data type |
| default | Supplies a default value |
| minLength | Checks minimum string length |
| validate | Runs a custom validation function |

## Supported Types

| Type | Description |
|---|---|
| string | Checks string values |
| number | Checks and converts finite numbers |
| boolean | Accepts true or false |
| url | Checks valid URLs |
| email | Checks email format |

## Custom Validation

You can provide your own validation function.

```javascript
const { validateEnv } = require("env-guard-js");

const config = validateEnv({
  API_KEY: {
    required: true,
    validate: (value) =>
      value.startsWith("sk_") || "must start with sk_"
  }
});
```

Return `true` when the value is valid, or a string describing the validation error.

## Error Handling

The library provides a custom `EnvValidationError` class.

```javascript
const {
  validateEnv,
  EnvValidationError
} = require("env-guard-js");

try {
  const config = validateEnv({
    DATABASE_URL: {
      required: true,
      type: "url"
    }
  });

  console.log(config);
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
```

## Custom Environment Object

You can supply your own environment object instead of using `process.env`.

```javascript
const { validateEnv } = require("env-guard-js");

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

console.log(config.PORT); // 5000
```

## Loading .env Files

This package validates environment variables. It does not load `.env` files automatically.

You can load them using Node.js:

```bash
node --env-file=.env app.js
```

Or use the dotenv package.

## Running Tests

Clone the repository and install any development dependencies if needed.

```bash
git clone https://github.com/Naman67780/env-guard-js.git
cd env-guard-js
npm test
```

## Example

See `examples/basic.js` for a complete working example.

Run it with:

```bash
node examples/basic.js
```

## License

MIT
