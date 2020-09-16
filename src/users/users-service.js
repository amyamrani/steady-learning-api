const bcrypt = require('bcrypt')
const crypto = require('crypto')

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
    return bcrypt.hash(password, 10)
  },

  createUser(knex, user) {
    return knex
      .insert(user)
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

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