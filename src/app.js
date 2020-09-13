require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const errorHandler = require('./errorHandler')
const validateBearerToken = require('./validateBearerToken')
const articlesRouter = require('./articles/articles-router')
const userArticlesRouter = require('./user-articles/user-articles-router')
const usersRouter = require('./users/users-router')
const plansRouter = require('./plans/plans-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(
  cors({
      origin: CLIENT_ORIGIN
  })
);

app.use('/api/users', usersRouter)

app.use(validateBearerToken)

app.use('/api/articles', articlesRouter)
app.use('/api/user_articles', userArticlesRouter)
app.use('/api/plans', plansRouter)

app.use(errorHandler)

module.exports = app