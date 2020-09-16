const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makePlansArray, seedPlans } = require('./plans.fixtures')
const { makeUsersArray, seedUsers } = require('./users.fixtures')

describe('Plans Endpoints', function() {
  let db
  const testUsers = makeUsersArray()

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

  describe('GET /api/plans', () => {
    context('Given no plans', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/plans')
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, [])
      })
    })

    context('Given there are plans in the database', () => {
      const testPlans = makePlansArray()

      beforeEach('insert plans', () => {
        seedPlans(db, testPlans)
      })

      it('responds with 200 and all of the plans', () => {
        return supertest(app)
          .get('/api/plans')
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, testPlans)
      })
    })
  })

  describe('GET /api/plans/:plan_id', () => {
    context('Given no plans', () => {
      it('responds with 404', () => {
        const planId = 123456
        return supertest(app)
          .get(`/api/plans/${planId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `Plan doesn't exist` } })
      })
    })

    context('Given there are plans in the database', () => {
      const testPlans = makePlansArray()

      beforeEach('insert plans', () => {
        seedPlans(db, testPlans)
      })

      it('responds with 200 and the specified plan', () => {
        const planId = 1
        const expectedPlan = testPlans[planId - 1]
        return supertest(app)
          .get(`/api/plans/${planId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(200, expectedPlan)
      })
    })
  })

  describe('DELETE /api/plans/:plan_id', () => {
    context('Given no plans', () => {
      it('responds with 404', () => {
        const planId = 123456
        return supertest(app)
          .delete(`/api/plans/${planId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `Plan doesn't exist` } })
      })
    })

    context('Given there are plans in the database', () => {
      const testUsers = makeUsersArray()
      const testPlans = makePlansArray()

      beforeEach('insert plans', () => {
        seedPlans(db, testPlans)
      })

      it('responds with 204 and removes the plan', () => {
        const idToRemove = 2
        const expectedPlans = testPlans.filter(plan => plan.id !== idToRemove)
        return supertest(app)
          .delete(`/api/plans/${idToRemove}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/plans')
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedPlans)
          )
      })
    })
  })

  describe('PATCH /api/plans/:plan_id', () => {
    context('Given no plans', () => {
      it('responds with 404', () => {
        const planId = 123456
        return supertest(app)
          .patch(`/api/plans/${planId}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .expect(404, { error: { message: `Plan doesn't exist` } })
      })
    })

    context('Given there are plans in the database', () => {
      const testUsers = makeUsersArray()
      const testPlans = makePlansArray()

      beforeEach('insert plans', () => {
        seedPlans(db, testPlans)
      })

      it('responds with 204 and updates the plan', () => {
        const idToUpdate = 2
        const updatePlan = {
          status: 'completed',
        }
        const expectedPlan = {
          ...testPlans[idToUpdate - 1],
          ...updatePlan
        }
        return supertest(app)
          .patch(`/api/plans/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send(updatePlan)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/plans/${idToUpdate}`)
              .set('Authorization', `Bearer ${testUsers[0].token}`)
              .expect(expectedPlan)
          )
      })

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/plans/${idToUpdate}`)
          .set('Authorization', `Bearer ${testUsers[0].token}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'status'`
            }
          })
      })
    })
  })
})
