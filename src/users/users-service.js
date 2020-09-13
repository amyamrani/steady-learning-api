const bcrypt          = require('bcrypt')                         // bcrypt will encrypt passwords to be saved in db
const crypto          = require('crypto')
const jwt = require('jsonwebtoken');
const config = require('../config');

const UsersService = {
  getById(knex, id) {
    return knex.from('users').select('*').where('id', id).first()
  },
  getByEmail(knex, email) {
    return knex.from('users').select('*').where('email', email || '').first()
  },
  getByToken(knex, token) {
    return knex.from('users').select('*').where('token', token || '').first()
  },

  hashPassword(password) {
    return new Promise((resolve, reject) =>
      bcrypt.hash(password, 10, (err, hash) => {
        err ? reject(err) : resolve(hash)
      })
    )
  },

  // user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created
  createUser(knex, user) {
    return knex
      .insert(user)
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  // crypto ships with node - we're leveraging it to create a random, secure token
  createToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, data) => {
        err ? reject(err) : resolve(data.toString('base64'))
      })
    })
  },

  checkPassword(reqPassword, foundUser) {
    return new Promise((resolve, reject) =>
      bcrypt.compare(reqPassword, foundUser.password, (err, response) => {
        if (err) {
          reject(err)
        }
        else if (response) {
          resolve(response)
        } else {
          reject(new Error('Passwords do not match.'))
        }
      })
    )
  },
  updateUserToken(knex, id, token) {
    return knex('users')
      .where({ id })
      .update({ token })
      .then(rows => {
        return rows[0]
      })
  },
  authenticate(knex, userReq) {
    this.getByToken(knex, userReq.token)
      .then((user) => {
        if (user && user.email == userReq.email) {
          return true
        } else {
          return false
        }
      })
  },
}

module.exports = UsersService