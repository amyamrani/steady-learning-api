const PlansService = {
  getAllPlans(knex) {
    return knex.select('*').from('plans')
  },
  getRecentPlan(knex, user_id) {
    return knex
      .select('*')
      .from('plans')
      .where('user_id', user_id)
      .whereNot('status', 'archived')
      .orderBy('id', 'desc')
      .limit(1)
      .then(rows => {
        return rows[0]
      })
  },
  insertPlan(knex, newPlan) {
    return knex
      .insert(newPlan)
      .into('plans')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('plans').select('*').where('id', id).first()
  },
  deletePlan(knex, id) {
    return knex('plans')
      .where({ id })
      .delete()
  },
  updatePlan(knex, id, newPlanFields) {
    return knex('plans')
      .where({ id })
      .update(newPlanFields)
  },
}

module.exports = PlansService