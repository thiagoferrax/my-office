exports.up = function(knex, Promise) {
    return knex.schema.createTable('equipments', table => {
        table.increments('id').primary()
        table.integer('deskId').references('id').inTable('desks')
        table.string('name').notNull()
        table.string('specification').notNull() 
        table.string('patrimony')
        table.timestamp('expirationDate')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('equipments')
};