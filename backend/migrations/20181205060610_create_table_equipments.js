exports.up = function(knex, Promise) {
    return knex.schema.createTable('equipments', table => {
        table.increments('id').primary()
        table.string('type').notNull()
        table.string('specification')
        table.string('patrimony')
        table.timestamp('expirationDate')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('equipments')
};