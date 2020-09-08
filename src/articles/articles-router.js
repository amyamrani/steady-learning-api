const express = require('express')
const ArticlesService = require('./articles-service')

const articlesRouter = express.Router()

const serializeArticle = article => ({
  id: article.id,
  topic: article.topic,
  url: article.url,
})

articlesRouter
  .route('/')

  .get((req, res, next) => {
    ArticlesService.getAllArticles(req.app.get('db')
)
      .then(articles => {
        res.json(articles.map(serializeArticle))
      })
      .catch(next)
  })

module.exports = articlesRouter