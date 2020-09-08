const express = require('express')
const UserArticlesService = require('./user-articles-service')

const userArticlesRouter = express.Router()

const serializeUserArticle = userArticle => ({
  id: userArticle.id,
  user_id: userArticle.user_id,
  article_id: userArticle.article_id,
  start_date: userArticle.start_date,
  completed_date: userArticle.completed_date,
  status: userArticle.status,
})

userArticlesRouter
  .route('/')

  .get((req, res, next) => {
    UserArticlesService.getAllUserArticles(req.app.get('db')
)
      .then(userArticles => {
        res.json(userArticles.map(serializeUserArticle))
      })
      .catch(next)
  })

module.exports = userArticlesRouter