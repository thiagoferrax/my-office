exports.up = function(knex, Promise) {
    return knex.schema.createTable('answers', table => {
        table.increments('id').primary()
        table.integer('evaluationId').references('id').inTable('evaluations').notNull()
        table.string('name').notNull()
        table.string('specification').notNull()        
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('answers')
};