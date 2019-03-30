exports.up = function(knex, Promise) {
    return knex.schema.createTable('equipments', table => {
        table.increments('id').primary()
        table.integer('deskId').references('id').inTable('desks').notNull()
        table.string('name').notNull()
        table.string('specification').notNull()        
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('equipments')
};