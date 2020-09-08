const UserArticlesService = {
  getAllUserArticles(knex) {
    return knex.select('*').from('user_articles')
  },
  insertUserArticle(knex, newUserArticle) {
    return knex
      .insert(newUserArticle)
      .into('user_articles')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('user_articles').select('*').where('id', id).first()
  },
  deleteUserArticle(knex, id) {
    return knex('user_articles')
      .where({ id })
      .delete()
  },
  updateUserArticle(knex, id, newUserArticleFields) {
    return knex('user_articles')
      .where({ id })
      .update(newUserArticleFields)
  },
}

module.exports = UserArticlesService