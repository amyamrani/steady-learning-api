const UserArticlesService = {
  getAllUserArticles(knex, user_id, plan_id) {
    let newestDate = new Date()
    newestDate.setHours(23,59,59,999)

    return knex
      .select(
        'user_articles.*',
        'articles.id as article_id',
        'articles.title as article_title',
        'articles.topic as article_topic',
        'articles.url as article_url',
      )
      .from('user_articles')
      .join('articles', 'articles.id', 'user_articles.article_id')
      .where('user_articles.user_id', user_id)
      .where('user_articles.plan_id', plan_id)
      .where('user_articles.start_date', '<', newestDate)
      .whereNot('user_articles.status', 'archived')
      .orderBy('id', 'desc')
  },
  getActiveUserArticlesCount(knex, user_id, plan_id) {
    let newestDate = new Date()
    newestDate.setHours(23,59,59,999)

    return knex
      .count('id')
      .from('user_articles')
      .where('plan_id', plan_id)
      .where('user_id', user_id)
      .where('status', 'active')
      .then(rows => {
        return rows[0]
      })
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
      .where('user_articles.id', id)
      .first()
  },
  deleteUserArticle(knex, id) {
    return knex('user_articles')
      .where({ id })
      .delete()
  },
  archiveIncompleteUserArticles(knex, user_id) {
    return knex('user_articles')
      .where({ status: 'active', user_id: user_id })
      .update({ status: 'archived' })
  },
  updateUserArticle(knex, id, newUserArticleFields) {
    return knex('user_articles')
      .where({ id })
      .update(newUserArticleFields)
  },
}

module.exports = UserArticlesService