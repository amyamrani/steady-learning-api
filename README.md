# Steady Learning API

Server API interface for storing and delivering data to Steady Learning application

## Introduction

Users are provided with a new article each day about a topic that they are interested in learning about for a set number of days

## Live App
https://steady-learning.vercel.app

## Client Repo
https://github.com/amyamrani/steady-learning

## API Endpoints

### Sign Up: `POST /api/signup`

Adds new user credentials to database and returns a JWT as long as the email is unique

**Sample Request Body**

```
{
  "first_name": "New",
  "last_name": "User",
  "email": "newuser@gmail.com",
  "password': "Password123"
}
```

**Sample Response Body**

```
{
  "id": 5,
  "first_name": "New",
  "last_name": "User",
  "email": "newuser@gmail.com",
  "password": "Password123",
  "date_created": "2020-09-19T20:36:38.024Z",
  "token": "tHiSisASaMpLEjWtAUthToKEN"
}
```

### Login: `POST /api/login`

Validates the login credentials against the database and returns a JWT

**Sample Request Body**

```
{
  "email": "newuser@gmail.com",
  "password': "Password123"
}
```
**Sample Response Body**

```
{
  "id": 5,
  "first_name":"New",
  "last_name":"User",
  "email":"newuser@gmail.com",
  "token":"tHiSisASaMpLEjWtAUthToKEN",
  "date_created":"2020-09-19T20:36:38.024Z"
}
```

### Add a New Topic: `POST /api/plans`

Creates a plan for the new topic

**Sample Request Body**

```
{
  topic: "Cooking Basics",
  day_count: "2"
}
```

**Sample Response Body**

```
{
  id: 38,
  user_id: 5,
  topic: "Cooking Basics",
  day_count: 2,
  status: "active"
}
```

### Update/Archive a Plan : `PATCH /api/plans/:plan_id`

Updates a user's plan and returns a `204 No Content`

**Sample Request Body**

```
{
  status: "archived"
}
```

### Get Plan : `GET /api/plans/recent_plan`

Retrieves the user's active plan

**Sample Response Body**

```
{
  id: 38,
  user_id: 5,
  topic: "Cooking Basics",
  day_count: 2,
  status: "active"
}
```

### Get User Articles : `GET /api/user_articles?plan_id=38`

Returns the user articles in a given plan

**Sample Response Body**

```
[
  {
    "id": 66,
    "user_id": 5,
    "article":
    {
      "id": 1,
      "title": "How to Make a Cake",
      "topic": "Cooking Basics",
      "url": "https://www.bhg.com/recipes/how-to/bake/how-to-make-a-cake/"
    },
    {
      "id": 2,
      "title": "Grill a Steak",
      "topic": "Cooking Basics",
      "url": "https://www.foodnetwork.com/how-to/articles/how-to-grill-steak-a-step-by-step-guide"
    },
    "start_date": "2020-09-19T20:52:06.922Z",
    "completed_date": null,
    "status": "active",
    "plan_id": 38
  }
]
```

### Update a User Article : `PATCH /api/user_articles/:id`

Updates a user article by marking it complete or incomplete and returns a `204 No Content`

**Sample Request Body**

```
{
  completed_date: "2020-09-21T00:30:07.695Z",
  status: "completed"
}
```

## Technologies Used
- Back End
  - Node and Express
  - JWT and bcrypt

- Testing
  - Mocha
  - Chai and Supertest

- Database
  - PostgreSQL
  - Knex.js

- Production
  - Deployed via Heroku
