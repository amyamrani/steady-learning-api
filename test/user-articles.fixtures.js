function makeUserArticlesArray() {
  return [
    {
      id: 1,
      user_id: 1,
      article_id: 1,
      start_date: '2020-09-12T21:53:33.000Z',
      status: 'active',
      plan_id: 1,
    },
  ];
}

function makeSerializedUserArticlesArray() {
  return [
    {
      id: 1,
      user_id: 1,
      article: {
        id: 1,
        title: 'How to Make a Cake',
        url: 'https://www.bhg.com/recipes/how-to/bake/how-to-make-a-cake/',
        topic: 'Cooking Basics',
      },
      start_date: '2020-09-12T21:53:33.000Z',
      status: 'active',
      plan_id: 1,
      completed_date: null,
    },
  ];
}

function seedUserArticles(db, userArticles) {
  return db
    .into('user_articles')
    .insert(userArticles)
    .then(() => {
      return db.raw(`SELECT setval('user_articles_id_seq',?)`, [
        userArticles[userArticles.length - 1].id,
      ]);
    });
}

module.exports = {
  makeUserArticlesArray,
  seedUserArticles,
  makeSerializedUserArticlesArray,
}