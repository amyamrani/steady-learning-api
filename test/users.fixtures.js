const bcrypt = require('bcrypt')

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      password: 'secret',
      date_created: '2020-09-01T16:28:32.615Z',
      token: 'iTwYbO0o+yHxuionA4QPVg=='
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@smith.com',
      password: 'secret',
      date_created: '2020-09-02T10:10:30.615Z',
      token: 'RTxYb30o4yHx5ionD4QRVR=='
    }
  ]
}

function seedUsers(db, users) {
  const seededUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 10),
  }));

  return db
    .into('users')
    .insert(seededUsers)
    .then(() => {
      return db.raw(`SELECT setval('users_id_seq',?)`, [
        users[users.length - 1].id,
      ]);
    });
}

module.exports = {
  makeUsersArray,
  seedUsers
}