require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const errorHandler = require('./errorHandler')
const validateBearerToken = require('./validateBearerToken')
const articlesRouter = require('./articles/articles-router')

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

app.use(validateBearerToken)

app.use('/api/articles', articlesRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use(errorHandler)

module.exports = app