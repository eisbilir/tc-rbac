require('dotenv').config()
module.exports = {
  // the log level, default is 'debug'
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  // the server port, default is 3000
  PORT: process.env.PORT || 3000,
  // the server api base path
  BASE_PATH: process.env.BASE_PATH || '/api/v5',

  // The authorization secret used during token verification.
  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  // The valid issuer of tokens, a json array contains valid issuer.
  VALID_ISSUERS: process.env.VALID_ISSUERS || '["https://api.topcoder-dev.com", "https://api.topcoder.com", "https://topcoder-dev.auth0.com/", "https://auth.topcoder-dev.com/"]',
  // Auth0 URL, used to get TC M2M token
  AUTH0_URL: process.env.AUTH0_URL,
  // Auth0 audience, used to get TC M2M token
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  // Auth0 token cache time, used to get TC M2M token
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  // Auth0 client id, used to get TC M2M token
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  // Auth0 client secret, used to get TC M2M token
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  // Proxy Auth0 URL, used to get TC M2M token
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,

  m2m: {
    M2M_AUDIT_USER_ID: process.env.M2M_AUDIT_USER_ID || '00000000',
    M2M_AUDIT_HANDLE: process.env.M2M_AUDIT_HANDLE || 'TopcoderService'
  },

  // MySql database url.
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://coder:topcoder@localhost:3306/Authorization',
  // string - PostgreSQL database target schema
  DB_SCHEMA_NAME: process.env.DB_SCHEMA_NAME || 'Authorization',
  // the default path for importing and exporting data
  DEFAULT_DATA_FILE_PATH: './data/demo-data.json'
}
