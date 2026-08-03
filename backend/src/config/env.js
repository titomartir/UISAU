const path = require('path');

require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || path.resolve(process.cwd(), '.env')
});

class ConfigValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

const VALID_NODE_ENVS = new Set(['development', 'test', 'production']);
const PLACEHOLDER_PREFIXES = ['CHANGE_ME', '__SET_', 'XXXX'];

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function readRaw(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : value;
}

function hasPlaceholder(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  return PLACEHOLDER_PREFIXES.some((prefix) => value.toUpperCase().startsWith(prefix));
}

function assertNonEmpty(name, value) {
  if (!value) {
    throw new ConfigValidationError(`Missing required environment variable: ${name}`);
  }
}

function requireString(name, options = {}) {
  const {
    allowInsecureDevDefault = null,
    validate,
    disallowPlaceholder = false,
    disallowExampleInvalid = false
  } = options;

  let value = readRaw(name);

  if (!value && allowInsecureDevDefault !== null && !isProduction()) {
    value = allowInsecureDevDefault;
  }

  assertNonEmpty(name, value);

  if (disallowPlaceholder && hasPlaceholder(value)) {
    throw new ConfigValidationError(`Environment variable ${name} contains a placeholder and must be replaced before use.`);
  }

  if (disallowExampleInvalid && /@example\.invalid$/i.test(value)) {
    throw new ConfigValidationError(`Environment variable ${name} must be replaced with a real administrative email before enabling bootstrap.`);
  }

  if (validate && !validate(value)) {
    throw new ConfigValidationError(`Environment variable ${name} is invalid.`);
  }

  return value;
}

function requireInteger(name, options = {}) {
  const value = requireString(name, options);
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ConfigValidationError(`Environment variable ${name} must be a positive integer.`);
  }

  return parsed;
}

function readBoolean(name, fallback = false) {
  const value = readRaw(name);
  if (!value) {
    return fallback;
  }

  if (/^(1|true|yes|on)$/i.test(value)) {
    return true;
  }

  if (/^(0|false|no|off)$/i.test(value)) {
    return false;
  }

  throw new ConfigValidationError(`Environment variable ${name} must be a boolean-like value.`);
}

function requireUrl(name, options = {}) {
  return requireString(name, {
    ...options,
    validate: (value) => {
      try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    }
  });
}

function requireEmail(name, options = {}) {
  return requireString(name, {
    ...options,
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  });
}

function requireDuration(name) {
  return requireString(name, {
    validate: (value) => /^\d+[smhd]$/i.test(value)
  });
}

function requireNodeEnv() {
  const nodeEnv = requireString('NODE_ENV', {
    allowInsecureDevDefault: 'development'
  });

  if (!VALID_NODE_ENVS.has(nodeEnv)) {
    throw new ConfigValidationError('Environment variable NODE_ENV must be one of: development, test, production.');
  }

  return nodeEnv;
}

function requireEncryptionKey() {
  const key = requireString('ENCRYPTION_KEY');

  if (key.length !== 32) {
    throw new ConfigValidationError('Environment variable ENCRYPTION_KEY must be exactly 32 characters long.');
  }

  return key;
}

function getDatabaseConfig() {
  return {
    host: requireString('DB_HOST', { allowInsecureDevDefault: 'localhost' }),
    port: requireInteger('DB_PORT', { allowInsecureDevDefault: '5432' }),
    name: requireString('DB_NAME', { allowInsecureDevDefault: 'encuestas_satisfaccion' }),
    user: requireString('DB_USER', { allowInsecureDevDefault: 'postgres' }),
    password: requireString('DB_PASSWORD', {
      allowInsecureDevDefault: 'postgres'
    })
  };
}

function getServerConfig() {
  const nodeEnv = requireNodeEnv();

  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    host: requireString('HOST', { allowInsecureDevDefault: '0.0.0.0' }),
    port: requireInteger('PORT', { allowInsecureDevDefault: '5000' }),
    frontendUrl: requireUrl('FRONTEND_URL', {
      allowInsecureDevDefault: 'http://localhost:5173'
    }),
    database: getDatabaseConfig(),
    jwt: {
      secret: requireString('JWT_SECRET'),
      refreshSecret: requireString('JWT_REFRESH_SECRET'),
      expiresIn: requireDuration('JWT_EXPIRES_IN'),
      refreshExpiresIn: requireDuration('JWT_REFRESH_EXPIRES_IN')
    },
    encryptionKey: requireEncryptionKey()
  };
}

function getSeedConfig() {
  const nodeEnv = requireNodeEnv();
  const bootstrapEnabled = readBoolean('ADMIN_BOOTSTRAP_ENABLED', false);

  const config = {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    bootstrapEnabled,
    database: getDatabaseConfig()
  };

  if (bootstrapEnabled) {
    config.admin = {
      email: requireEmail('ADMIN_EMAIL', {
        disallowPlaceholder: true,
        disallowExampleInvalid: true
      }),
      password: requireString('ADMIN_PASSWORD', {
        disallowPlaceholder: true,
        validate: (value) => value.length >= 12
      })
    };
  }

  return config;
}

module.exports = {
  ConfigValidationError,
  getServerConfig,
  getSeedConfig,
  getDatabaseConfig,
  requireEncryptionKey
};