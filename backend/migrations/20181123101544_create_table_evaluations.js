
exports.up = function(knex, Promise) {
    return knex.schema.createTable('desks', table => {
        table.increments('id').primary()
        table.integer('roomId').references('id').inTable('rooms').notNull()
        table.integer('userId').references('id').inTable('users').notNull()
        table.string('chairDirection').notNull()
        table.integer('x').notNull()
        table.integer('y').notNull()
        table.timestamps()      
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('desks')
};
