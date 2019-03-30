module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const desk = {
            id: req.body.id,
            roomId: req.body.roomId,
            userId: req.decoded.id,
            equipments: req.body.equipments,
            chairDirection: req.body.chairDirection,
            x: req.body.x || 0,
            y: req.body.y || 0
        }

        if (req.params.id) desk.id = req.params.id

        try {
            existsOrError(desk.roomId, 'Room was not informed!')
            existsOrError(desk.chairDirection, 'Chair direction was not informed!')
            existsOrError(desk.userId, 'User was not informed!')
        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        const equipments = getNotEmptyEquipments(desk.equipments || [])
        delete desk.equipments

        if (desk.id) {
            desk.updated_at = new Date()

            app.db('desks')
                .update(desk)
                .where({ id: desk.id })
                .then(_ => {
                    if (equipments && equipments.length > 0) {
                        updateEquipments(desk.id, equipments, res)
                    } else {
                        res.status(204).send()
                    }
                })
                .catch(err => res.status(500).json({ errors: [err] }))


        } else {

            try {
                desk.created_at = new Date()
                desk.updated_at = null

                app.db('desks')
                    .insert(desk)
                    .returning('id')
                    .then(deskId => {
                        if (equipments && equipments.length > 0) {    
                            insertEquipments(deskId[0], equipments, res)
                        } else {
                            res.status(204).send()
                        }
                    })
                    .catch(err => {
                        res.status(500).json({ errors: [err] })
                    })
            } catch (msg) {
                return res.status(400).json({ errors: [msg] })
            }
        }
    }

    const getNotEmptyEquipments = (equipments) => {
        return equipments.reduce((notEmptyEquipments, equipment) => {
            const keys = Object.keys(equipment)
            if (keys.length > 0 && equipment.name && equipment.specification) {
                notEmptyEquipments.push(equipment)
            }
            return notEmptyEquipments
        }, [])
    }

    const updateEquipments = (deskId, equipments, res) => {
        app.db('answers').where({ deskId: deskId }).del().then(
            rowsDeleted => {
                insertEquipments(deskId, equipments, res)
            }
        )
    }

    const insertEquipments = (deskId, equipments, res) => {
        const rows = getEquipmentsToInsert(deskId, equipments)
        const chunkSize = rows.lenght
        app.db.batchInsert('answers', rows, chunkSize)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const remove = (req, res) => {
        const deskId = req.params.id
        try {
            existsOrError(deskId, "Desk id was not informed!")

            app.db('answers').where({ deskId }).del().then(
                answersDeleted => {
                    app.db('desks').where({ id: deskId }).del().then(
                        rowsDeleted => {
                            existsOrError(rowsDeleted, "Desk was not found!")
                            res.status(204).send()
                        }
                    ).catch(err => res.status(500).json({ errors: [err] }))
                }
            )
        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    const getDesksWithEquipments = (desks) => {
        return desks && desks.reduce((desksList, desk) => {
            const foundDesk = desksList.filter(e => e.id == desk.id)
            if (foundDesk.length > 0) {
                const index = desksList.indexOf(foundDesk[0])
                if(desk.equipmentName &&  desk.equipmentSpecification) {
                    desksList[index].equipments.push({ name: desk.equipmentName, specification: desk.equipmentSpecification })
                }
            } else {
                if(desk.equipmentName &&  desk.equipmentSpecification) {
                    desk.equipments = [{ name: desk.equipmentName, specification: desk.equipmentSpecification }]
                } else {
                    desk.equipments = [{}]
                }
                desksList.push({ ...desk })
            }
            return desksList
        }, [])
    }

    const get = (req, res) => {
        app.db.select(
            {
                id: 'desks.id',
                roomId: 'desks.roomId',
                userId: 'desks.userId',
                date: 'desks.created_at',
                roomName: 'rooms.name',
                chairDirection: 'desks.chairDirection',
                x: 'desks.x',
                y: 'desks.y',
                equipmentName: 'answers.name',
                equipmentSpecification: 'answers.specification'
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('answers', 'answers.deskId', 'desks.id')
            .where({ 'desks.userId': req.decoded.id })
            .orderBy('desks.created_at', 'desc')
            .then(desks => {
                res.json(getDesksWithEquipments(desks))
            })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getOfficeData = (req, res) => {
        app.db.select(
            {
                room: 'rooms.name',
                id: 'desks.id',
                chairDirection: 'desks.chairDirection',
                x: 'desks.x',
                y: 'desks.y',
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .where({ 'desks.userId': req.decoded.id, 'rooms.id': req.params.id })
            .orderBy('desks.created_at', 'desc')
            .then(desks => {
                const officeData = desks && desks.reduce((data, desk) => {
                    data.push({ ...desk })
                    return data
                }, [])
                res.json(officeData)
            })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getById = (req, res) => {
        app.db.select(
            {
                room: 'rooms.name',
                roomId: 'rooms.id',
                id: 'desks.id',
                chairDirection: 'desks.chairDirection',
                x: 'desks.x',
                y: 'desks.y',
                equipmentName: 'answers.name',
                equipmentSpecification: 'answers.specification'
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('answers', 'answers.deskId', 'desks.id')
            .where({ 'desks.id': req.params.id })
            .then(desks => res.json(getDesksWithEquipments(desks)[0]))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getAnswers = (req, res) => {
        app.db.select(
            {
                id: 'answers.id',
                deskId: 'answers.deskId',
                name: 'answers.name',
                specification: 'answers.specification',
            }
        ).from('answers')
            .where({ 'answers.deskId': req.params.id })
            .then(answers => res.json(answers))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getEquipmentsToInsert = (deskId, equipments) => {
        return equipments.reduce((rows, equipment) => {
            rows.push({ deskId, name: equipment.name, specification: equipment.specification })
            return rows
        }, [])
    }

    return { save, remove, get, getById, getAnswers, getOfficeData }
}