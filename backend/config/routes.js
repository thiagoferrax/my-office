const express = require('express')
const auth = require('./auth')

module.exports = app => {
    /*
     * Rotas protegidas por Token JWT
     */
    const protectedApi = express.Router()
    app.use('/api', protectedApi)

    protectedApi.use(auth)

    protectedApi.post('/checklists', app.api.checklist.save)
    protectedApi.get('/checklists', app.api.checklist.get)
    protectedApi.post('/checklists/clone', app.api.checklist.clone)       
    protectedApi.get('/checklists/tree', app.api.checklist.getTree)
    protectedApi.put('/checklists/:id', app.api.checklist.save)
    protectedApi.delete('/checklists/:id', app.api.checklist.remove)
    protectedApi.get('/checklists/:id', app.api.checklist.getById)

    protectedApi.post('/rooms', app.api.room.save)
    protectedApi.get('/rooms', app.api.room.get)
    protectedApi.put('/rooms/:id', app.api.room.save)
    protectedApi.delete('/rooms/:id', app.api.room.remove)
    protectedApi.get('/rooms/:id', app.api.room.getById)

    protectedApi.post('/desks', app.api.desk.save)
    protectedApi.get('/desks', app.api.desk.get)
    protectedApi.get('/rooms/:id/officeData', app.api.desk.getOfficeData)
    protectedApi.put('/desks/:id', app.api.desk.save)
    protectedApi.delete('/desks/:id', app.api.desk.remove)
    protectedApi.get('/desks/:id', app.api.desk.getById)
    protectedApi.get('/desks/:id/equipments', app.api.desk.getEquipments)

    protectedApi.get('/dashboard/summary', app.api.dashboard.get)

    protectedApi.get('/timelines', app.api.timeline.get)

    protectedApi.get('/users', app.api.user.get)

    /*
     * Rotas abertas
     */
    const openApi = express.Router()
    app.use('/oapi', openApi)
    openApi.post('/signup', app.api.user.save)
    openApi.post('/signin', app.api.user.signin)
    openApi.post('/validateToken', app.api.user.validateToken)
}