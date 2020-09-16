function makePlansArray() {
  return [
    {
      id: 1,
      user_id: 1,
      day_count: 5,
      topic: 'Cooking Basics',
      status: 'active',
    },
    {
      id: 2,
      user_id: 1,
      day_count: 2,
      topic: 'Cooking Basics',
      status: 'completed',
    },
  ];
}

function seedPlans(db, plans) {
  return db
    .into('plans')
    .insert(plans)
    .then(() => {
      return db.raw(`SELECT setval('plans_id_seq',?)`, [
        plans[plans.length - 1].id,
      ]);
    });
}

module.exports = {
  makePlansArray,
  seedPlans,
}