/*
 * Configuration for DB migration.
 */

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'mysql://coder:topcoder@localhost:3306/Authorization'
  },
  test: {
    url: process.env.DATABASE_URL || 'mysql://coder:topcoder@localhost:3306/Authorization'
  },
  production: {
    url: process.env.DATABASE_URL
  }
}
