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
  plan_id: userArticle.plan_id,
})

userArticlesRouter
  .route('/')

  .get((req, res, next) => {
    UserArticlesService.getAllUserArticles(req.app.get('db'), req.user.id, req.query.plan_id)
      .then(userArticles => {
        res.json(userArticles.map(serializeUserArticle))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { topic, day_count } = req.body

    const articles = ArticlesService
      .getAllArticlesByTopic(req.app.get('db'), topic)
      .then(articles => {
        for (let i = 0; i < day_count; i++) {
          let start_date = new Date();
          start_date.setDate(start_date.getDate() + i);

          if (articles[i]) {
            const newUserArticle = { user_id: req.user.id, article_id: articles[i].id, start_date };

            UserArticlesService.insertUserArticle(req.app.get('db'), newUserArticle);
          }
        }
        res.status(201).end()
      })
      .catch(next)
  })

  .delete((req, res, next) => {
    UserArticlesService.archiveIncompleteUserArticles(req.app.get('db'), req.user.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

userArticlesRouter
  .route('/:id')

  .all((req, res, next) => {
    UserArticlesService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(userArticle => {
        if (!userArticle) {
          return res.status(404).json({
            error: { message: `User Article doesn't exist` }
          })
        }
        res.userArticle = userArticle
        next()
      })
      .catch(next)
  })

  .get((req, res, next) => {
    res.json(serializeUserArticle(res.userArticle))
  })

  .delete((req, res, next) => {
    UserArticlesService.deleteUserArticle(req.app.get('db'), req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(jsonParser, (req, res, next) => {
    const { completed_date, status } = req.body
    const updateUserArticle = { completed_date, status }

    const numberOfValues = Object.values(updateUserArticle).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'completed_date' or 'status'`
        }
      })
    }

    UserArticlesService.updateUserArticle(
      req.app.get('db'),
      req.params.id,
      updateUserArticle
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = userArticlesRouter