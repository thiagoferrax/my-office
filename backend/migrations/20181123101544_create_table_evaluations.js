
exports.up = function(knex, Promise) {
    return knex.schema.createTable('evaluations', table => {
        table.increments('id').primary()
        table.integer('projectId').references('id').inTable('projects').notNull()
        table.integer('userId').references('id').inTable('users').notNull()
        table.string('chairDirection').notNull()
        table.integer('x').notNull()
        table.integer('y').notNull()
        table.timestamps()      
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('evaluations')
};
