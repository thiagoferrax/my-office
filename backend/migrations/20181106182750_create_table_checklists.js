
exports.up = function(knex, Promise) {
    return knex.schema.createTable('employees', table => {
        table.increments('id').primary()
        table.string('description').notNull()
        table.integer('parentId').references('id').inTable('employees')
        table.integer('userId').references('id').inTable('users').notNull()  
        table.timestamps()       
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('employees')
};