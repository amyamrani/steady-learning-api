const ArticlesService = {
  getAllArticles(knex) {
    return knex.select('*').from('articles')
  },
  getAllArticlesByTopic(knex, topic) {
    return knex
      .select('*')
      .from('articles')
      .where({ topic })
  },
  insertArticle(knex, newArticle) {
    return knex
      .insert(newArticle)
      .into('articles')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('articles').select('*').where('id', id).first()
  },
  deleteArticle(knex, id) {
    return knex('articles')
      .where({ id })
      .delete()
  },
  updateArticle(knex, id, newArticleFields) {
    return knex('articles')
      .where({ id })
      .update(newArticleFields)
  },
}

module.exports = ArticlesService