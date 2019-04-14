exports.up = function(knex, Promise) {
    return knex.schema.createTable('desks_employees', table => {
        table.increments('id').primary()
        table.integer('employeeId').references('id').inTable('employees')
        table.integer('deskId').references('id').inTable('desks')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('desks_employees')
};