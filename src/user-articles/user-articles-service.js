const UserArticlesService = {
  getAllUserArticles(knex) {
    return knex
      .select(
        'user_articles.*',
        'articles.id as article_id',
        'articles.title as article_title',
        'articles.topic as article_topic',
        'articles.url as article_url'
      )
      .from('user_articles')
      .join('articles', 'articles.id', 'user_articles.article_id')
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