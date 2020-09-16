const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray, seedArticles } = require('./articles.fixtures')
const { makeUsersArray, seedUsers } = require('./users.fixtures')

describe('Articles Endpoints', function() {
  let db
  const testUsers = makeUsersArray();

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

  afterEach('cleanup', () => db.raw('TRUNCATE users, articles, user_articles, plans RESTART IDENTITY CASCADE'))

  describe('GET /api/articles', () => {
    context('Given no articles', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/articles')
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, [])
      })
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        seedArticles(db, testArticles)
      })

      it('responds with 200 and all of the articles', () => {
        return supertest(app)
          .get('/api/articles')
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, testArticles)
      })
    })
  })

  describe('GET /api/articles/:article_id', () => {
    context('Given no articles', () => {
      it('responds with 404', () => {
        const articleId = 123456
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        seedArticles(db, testArticles)
      })

      it('responds with 200 and the specified article', () => {
        const articleId = 2
        const expectedArticle = testArticles[articleId - 1]
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, expectedArticle)
      })
    })
  })

  describe('DELETE /api/articles/:article_id', () => {
    context('Given no articles', () => {
      it('responds with 404', () => {
        const articleId = 123456
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray()
      const testArticles = makeArticlesArray()

      it('responds with 204 and removes the article', () => {
        seedArticles(db, testArticles)
        const idToRemove = testArticles[0].id
        const expectedArticles = testArticles.filter(article => article.id !== idToRemove)
        return supertest(app)
          .delete(`/api/articles/${idToRemove}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/articles')
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedArticles)
          )
      })
    })
  })

  describe('PATCH /api/articles/:article_id', () => {
    context('Given no articles', () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .patch(`/api/articles/${articleId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray()
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        seedArticles(db, testArticles)
      })

      it('responds with 204 and updates the article', () => {
        const idToUpdate = testArticles[0].id
        const updateArticle = {
          title: 'updated article title',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send(updateArticle)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedArticle)
          )
      })

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'title', 'topic' and 'url'`
            }
          })
      })

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2
        const updateArticle = {
          title: 'updated article title',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }

        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send({
            ...updateArticle,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedArticle)
          )
      })
    })
  })
})
