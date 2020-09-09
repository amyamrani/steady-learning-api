const express = require('express')
const UserArticlesService = require('./user-articles-service')
const ArticlesService = require('../articles/articles-service')

const userArticlesRouter = express.Router()
const jsonParser = express.json()

const serializeUserArticle = userArticle => ({
  id: userArticle.id,
  user_id: userArticle.user_id,
  article: {
    id: userArticle.article_id,
    title: userArticle.article_title,
    topic: userArticle.article_topic,
    url: userArticle.article_url,
  },
  start_date: userArticle.start_date,
  completed_date: userArticle.completed_date,
  status: userArticle.status,
})

userArticlesRouter
  .route('/')

  .get((req, res, next) => {
    UserArticlesService.getAllUserArticles(req.app.get('db'))
      .then(userArticles => {
        res.json(userArticles.map(serializeUserArticle))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { user_id, topic, day_count } = req.body

    const articles = ArticlesService
      .getAllArticlesByTopic(req.app.get('db'), topic)
      .then(articles => {
        for (let i = 0; i < day_count; i++) {
          let start_date = new Date();
          start_date.setDate(start_date.getDate() + i);

          if (articles[i]) {
            const newUserArticle = { user_id, article_id: articles[i].id, start_date };

            UserArticlesService.insertUserArticle(req.app.get('db'), newUserArticle);
          }
        }
      })
  })

module.exports = userArticlesRouter