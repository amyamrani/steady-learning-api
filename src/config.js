module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://amy@localhost/steady-learning',
  CLIENT_ORIGIN: process.env.CLIENT_URL || 'http://localhost:3000',
  API_TOKEN_SECRET: process.env.API_TOKEN_SECRET || 'secret',
}