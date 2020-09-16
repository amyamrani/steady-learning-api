const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUserArticlesArray, makeSerializedUserArticlesArray, seedUserArticles } = require('./user-articles.fixtures')
const { makePlansArray, seedPlans } = require('./plans.fixtures')
const { makeArticlesArray, seedArticles } = require('./articles.fixtures')
const { makeUsersArray, seedUsers } = require('./users.fixtures')

describe('User Articles Endpoints', function() {
  let db
  const testUsers = makeUsersArray()
  const plans = makePlansArray()
  const articles = makeArticlesArray()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users, articles, user_articles, plans RESTART IDENTITY CASCADE'))

  beforeEach('insert users', () => seedUsers(db, testUsers));
  beforeEach('insert plans', () => seedPlans(db, plans));
  beforeEach('insert articles', () => seedArticles(db, articles));

  afterEach('cleanup', () => db.raw('TRUNCATE users, articles, user_articles, plans RESTART IDENTITY CASCADE'))

  describe('GET /api/user_articles', () => {
    context('Given no user articles', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/user_articles?plan_id=1')
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, [])
      })
    })

    context('Given there are user articles in the database', () => {
      const testUserArticles = makeUserArticlesArray()
      const expectedUserArticles = makeSerializedUserArticlesArray()

      beforeEach('insert user articles', () => {
        seedUserArticles(db, testUserArticles)
      })

      it('responds with 200 and all of the user articles', () => {
        return supertest(app)
          .get('/api/user_articles?plan_id=1')
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, expectedUserArticles)
      })
    })
  })

  describe('GET /api/user_articles/:user_article_id', () => {
    context('Given no user_articles', () => {
      it('responds with 404', () => {
        const userArticleId = 123456
        return supertest(app)
          .get(`/api/user_articles/${userArticleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `User Article doesn't exist` } })
      })
    })

    context('Given there are user articles in the database', () => {
      const testUserArticles = makeUserArticlesArray()

      beforeEach('insert user articles', () => {
        seedUserArticles(db, testUserArticles)
      })

      it('responds with 200 and the specified article', () => {
        const userArticleId = 1
        const expectedUserArticle = makeSerializedUserArticlesArray()[userArticleId - 1]
        return supertest(app)
          .get(`/api/user_articles/${userArticleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, expectedUserArticle)
      })
    })
  })

  describe('DELETE /api/user_articles/:user_article_id', () => {
    context('Given no user articles', () => {
      it('responds with 404', () => {
        const userArticleId = 123456
        return supertest(app)
          .delete(`/api/user_articles/${userArticleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `User Article doesn't exist` } })
      })
    })

    context('Given there are user articles in the database', () => {
      const testUsers = makeUsersArray()
      const testUserArticles = makeUserArticlesArray()

      beforeEach('insert user articles', () => {
        seedUserArticles(db, testUserArticles)
      })

      it('responds with 204 and removes the user article', () => {
        const idToRemove = 1
        const expectedUserArticles = testUserArticles.filter(userArticle => userArticle.id !== idToRemove)

        return supertest(app)
          .delete(`/api/user_articles/${idToRemove}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get('/api/user_articles?plan_id=1')
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedUserArticles)
          })
      })
    })
  })

  describe('PATCH /api/user_articles/:user_article_id', () => {
    context('Given no user articles', () => {
      it('responds with 404', () => {
        const userArticleId = 123456
        return supertest(app)
          .patch(`/api/user_articles/${userArticleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `User Article doesn't exist` } })
      })
    })

    context('Given there are user articles in the database', () => {
      const testUsers = makeUsersArray()
      const testUserArticles = makeUserArticlesArray()
      const serializedUserArticles = makeSerializedUserArticlesArray()

      beforeEach('insert user articles', () => {
        seedUserArticles(db, testUserArticles)
      })

      it('responds with 204 and updates the user article', () => {
        const idToUpdate = 1
        const updateUserArticle = {
          status: 'completed',
          completed_date: '2020-09-13T22:01:27.000Z'
        }
        const expectedUserArticles = {
          ...serializedUserArticles[idToUpdate - 1],
          ...updateUserArticle
        }

        return supertest(app)
          .patch(`/api/user_articles/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send(updateUserArticle)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/user_articles/${idToUpdate}`)
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedUserArticles)
          )
      })

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 1
        return supertest(app)
          .patch(`/api/user_articles/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'completed_date' or 'status'`
            }
          })
      })
    })
  })
})
