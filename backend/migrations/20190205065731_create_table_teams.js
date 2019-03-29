exports.up = function(knex, Promise) {
    return knex.schema.createTable('teams', table => {
        table.increments('id').primary()
        table.integer('roomId').references('id').inTable('rooms').notNull()
        table.integer('userId').references('id').inTable('users').notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('teams')
};