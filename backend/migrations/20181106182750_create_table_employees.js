
exports.up = function(knex, Promise) {
    return knex.schema.createTable('employees', table => {
        table.increments('id').primary()
        table.string('name').notNull()
        table.string('identifier')
        table.string('email')
        table.string('phone')
        table.integer('userId').references('id').inTable('users').notNull()  
        table.timestamps()       
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('employees')
};