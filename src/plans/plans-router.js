const express = require('express')
const path = require('path')
const PlansService = require('./plans-service')
const ArticlesService = require('../articles/articles-service')
const UserArticlesService = require('../user-articles/user-articles-service')

const plansRouter = express.Router()
const jsonParser = express.json()

const serializePlan = plan => ({
  id: plan.id,
  user_id: plan.user_id,
  topic: plan.topic,
  day_count: plan.day_count,
  status: plan.status,
})

plansRouter
  .route('/')

  .get((req, res, next) => {
    PlansService.getAllPlans(req.app.get('db'))
      .then(plans => {
        res.json(plans.map(serializePlan))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { day_count, topic } = req.body
    const newPlan = {
      day_count,
      topic,
      user_id: req.user.id,
      status: 'active',
    }

    for (const [key, value] of Object.entries(newPlan)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    if (!day_count || day_count < 1 || day_count > 5) {
      return res.status(400).json({
        error: { message: 'Day count must be between 1 and 5' }
      })
    }

    PlansService.insertPlan(req.app.get('db'), newPlan)
      .then(plan => {

        const articles = ArticlesService
        .getAllArticlesByTopic(req.app.get('db'), plan.topic)
        .then(articles => {
          for (let i = 0; i < day_count; i++) {
            let start_date = new Date();
            start_date.setDate(start_date.getDate() + i);

            if (articles[i]) {
              const newUserArticle = {
                user_id: req.user.id,
                article_id: articles[i].id,
                start_date,
                plan_id: plan.id,
              };

              UserArticlesService.insertUserArticle(req.app.get('db'), newUserArticle);
            }
          }
        })

        res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${plan.id}`))
        .json(serializePlan(plan))
      })
      .catch(next)
  })

plansRouter
  .route('/recent_plan')
  .get((req, res, next) => {
    PlansService.getRecentPlan(req.app.get('db'), req.user.id)
      .then(plan => {
        if (plan) {
          res.json(serializePlan(plan))
        } else {
          res.json({})
        }
      })
      .catch(next)
  })

plansRouter
  .route('/:plan_id')

  .all((req, res, next) => {
    PlansService.getById(req.app.get('db'), req.params.plan_id)
      .then(plan => {
        if (!plan) {
          return res.status(404).json({
            error: { message: `Plan doesn't exist` }
          })
        }
        res.plan = plan
        next()
      })
      .catch(next)
  })

  .get((req, res, next) => {
    res.json(serializePlan(res.plan))
  })

  .delete((req, res, next) => {
    PlansService.deletePlan(req.app.get('db'), req.params.plan_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(jsonParser, (req, res, next) => {
    const { status } = req.body
    const planToUpdate = { status }

    const numberOfValues = Object.values(planToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'status'`
        }
      })
    }

    if (status == 'completed') {
      UserArticlesService.getActiveUserArticlesCount(req.app.get('db'), req.user.id, req.params.plan_id).then(count => {
        if (count.count == 0) {
          PlansService.updatePlan(
            req.app.get('db'),
            req.params.plan_id,
            planToUpdate
          )
            .then(numRowsAffected => {
              res.status(204).end()
            })
            .catch(next)
        } else {
          res.status(204).end()
        }
      })
    } else {
      PlansService.updatePlan(
        req.app.get('db'),
        req.params.plan_id,
        planToUpdate
      )
        .then(numRowsAffected => {
          res.status(204).end()
        })
        .catch(next)
    }
  })

module.exports = plansRouter