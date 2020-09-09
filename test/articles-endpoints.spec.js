const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray, makeMaliciousArticle } = require('./articles.fixtures')
// const { makeUsersArray } = require('./users.fixtures')

describe('Articles Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users, articles, user_articles RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE users, articles, user_articles RESTART IDENTITY CASCADE'))

  describe(`GET /api/articles`, () => {
    context(`Given no articles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/articles')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
    })

  //   context('Given there are articles in the database', () => {
  //     const testUsers = makeUsersArray();
  //     const testArticles = makeArticlesArray()

  //     beforeEach('insert articles', () => {
  //       return db
  //         .into('blogful_users')
  //         .insert(testUsers)
  //         .then(() => {
  //           return db
  //             .into('blogful_articles')
  //             .insert(testArticles)
  //         })
  //     })

  //     it('responds with 200 and all of the articles', () => {
  //       return supertest(app)
  //         .get('/api/articles')
  //         .expect(200, testArticles)
  //     })
  //   })


  })
})