const express = require('express')
const UsersService = require('./users-service')
const { request } = require('express')

const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter
  .route('/signup')

  .post(jsonParser, (request, response, next) => {
    const user = request.body

    for (const key of ['first_name', 'last_name', 'email', 'password']) {
      if (user[key] == null) {
        return response.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    UsersService.hashPassword(user.password)
      .then((hashedPassword) => {
        delete user.password
        console.log('please222')
        user.password = hashedPassword
      })
      .then(() => UsersService.createToken())
      .then(token => user.token = token)
      .then(() => UsersService.createUser(request.app.get('db'), user))
      .then(user => {
        console.log('please444')
        delete user.password
        response.status(201).json(user)
      })
      .catch((err) => {
        console.log("hisiijvdisa")
        console.log(err)
        next()
      })
  })

usersRouter
  .route('/login')

  .post(jsonParser, (request, response, next) => {
    const userReq = request.body
    let user;

    for (const key of ['email', 'password']) {
      if (userReq[key] == null) {
        return response.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    UsersService.getByEmail(request.app.get('db'), userReq.email)
      .then(foundUser => {
        user = foundUser
        if (!foundUser) {
          throw new Error('User cannot be found.');
        }

        return UsersService.checkPassword(userReq.password, foundUser)
      })
      .then(res => {
        return UsersService.createToken()
      })
      .then(token => {
        UsersService.updateUserToken(request.app.get('db'), user.id, token)
        return token;
      })
      .then((token) => {
        const newUser = {...user, token: token};
        delete newUser.password
        response.status(200).json(newUser)
      })
      .catch((err) => {
        next()
      })
  })

module.exports = usersRouter