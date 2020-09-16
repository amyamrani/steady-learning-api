const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray, seedUsers } = require('./users.fixtures')

describe('User Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users, articles, user_articles, plans RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, articles, user_articles, plans RESTART IDENTITY CASCADE'))

  describe('POST /api/users/signup', () => {
    it('creates a user, responding with 201 and the new user',  function() {
      const testUsers = makeUsersArray()
      const newUser = testUsers[0]

      return supertest(app)
        .post('/api/users/signup')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.first_name).to.eql(newUser.first_name)
          expect(res.body.last_name).to.eql(newUser.last_name)
          expect(res.body.email).to.eql(newUser.email)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('token')
        })
    })

    const requiredFields = ['first_name', 'last_name', 'email', 'password']

    requiredFields.forEach(field => {
      const newUser = {
        first_name: 'first',
        last_name: 'last',
        email: 'email@email.com',
        password: 'password',
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/api/users/signup')
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe('POST /api/users/login', () => {
    it('logins the user, responding with 201 and the user',  function() {
      const testUsers = makeUsersArray()
      seedUsers(db, testUsers)
      const testUser = testUsers[0]

      return supertest(app)
        .post('/api/users/login')
        .send({email: testUser.email, password: testUser.password})
        .expect(200)
        .expect(res => {
          expect(res.body.first_name).to.eql(testUser.first_name)
          expect(res.body.last_name).to.eql(testUser.last_name)
          expect(res.body.email).to.eql(testUser.email)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('token')
        })
    })

    const requiredFields = ['email', 'password']

    requiredFields.forEach(field => {
      const testUser = {
        email: 'email@email.com',
        password: 'password',
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete testUser[field]

        return supertest(app)
          .post('/api/users/login')
          .send(testUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })
})
