module.exports = app => {
    const { existsOrError } = app.api.validation

    const getFormatedDate = (isoDate) => {
        if (!isoDate) {
            return undefined
        }
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' }

        const date = new Date(isoDate)
        return date.toLocaleDateString('en-US', options)
    }

    const validate = (req, res) => new Promise((resolve, reject) => {
        const carrier = { req, res }

        carrier.userId = req.decoded.id

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

            carrier.desk = desk

            resolve(carrier)
        } catch (err) {
            reject(err)
        }
    })

    const saveDesk = (carrier) => new Promise((resolve, reject) => {
        const desk = carrier.desk
        const equipments = getNotEmptyEquipments(desk.equipments || [])

        delete desk.equipments

        if (!desk.id) {
            desk.created_at = new Date()
            desk.updated_at = null

            app.db('desks')
                .insert(desk)
                .returning('id')
                .then(deskId => {
                    carrier.deskId = deskId[0]
                    carrier.equipments = equipments
                    resolve(carrier)
                })
                .catch(err => reject(err))
        } else {
            desk.updated_at = new Date()

            app.db('desks')
                .update(desk)
                .where({ id: desk.id })
                .then(_ => {
                    carrier.deskId = desk.id
                    carrier.equipments = equipments
                    resolve(carrier)
                })
                .catch(err => reject(err))
        }
    })

    const analyzeEquipments = (carrier) => new Promise((resolve, reject) => {

        const deskId = carrier.deskId
        const equipments = carrier.equipments

        if (equipments && equipments.length > 0) {
            const patrimonies = equipments.map(equipment => ({
                patrimony: equipment.patrimony, equipment
            }))

            app.db('equipments').whereIn('patrimony', Object.keys(patrimonies))
                .then(equipmentsFound => {
                    const equipmentsToUpdate = equipmentsFound.map(e => ({ ...e, ...patrimonies[e.patrimony] }))
                    const patrimoniesFound = equipmentsFound.map(e => e.patrimony)
                    const equipmentsToInsert = equipments.filter(e => !patrimoniesFound.includes(e.patrimony))

                    carrier.equipmentsToUpdate = equipmentsToUpdate
                    carrier.equipmentsToInsert = equipmentsToInsert

                    resolve(carrier)
                }
                ).catch(err => reject(err))
        } else {
            resolve(carrier)
        }
    })

    const insertEquipments = (carrier) => new Promise((resolve, reject) => {
        const equipments = carrier.equipmentsToInsert
        const userId = carrier.userId

        if (equipments && equipments.length > 0) {
            const rows = getEquipmentsToInsert(equipments, userId)
            const chunkSize = rows.length

            app.db.batchInsert('equipments', rows, chunkSize)
                .returning('id')
                .then(ids => {
                    carrier.equipmentsIds = ids
                    resolve(carrier)
                })
                .catch(err => {
                    reject(err)})
        } else {
            resolve(carrier)
        }
    })

    const updateEquipments = (carrier) => new Promise((resolve, reject) => {
        const equipments = carrier.equipmentsToUpdate
        const userId = carrier.userId

        if (equipments && equipments.length > 0) {
            const rows = getEquipmentsToUpdate(equipments, userId)
            const chunkSize = rows.length

            app.db.batchUpdate('equipments', rows, chunkSize)
                .returning('id')
                .then(ids => {
                    carrier.equipmentsIds =
                        carrier.equipmentsIds ?
                            [...carrier.equipmentsIds, ...ids] : ids
                    resolve(carrier)
                })
                .catch(err => reject(err))
        } else {
            resolve(carrier)
        }
    })

    const insertDesksEquipments = (carrier) => new Promise((resolve, reject) => {
        const equipmentsIds = carrier.equipmentsIds
        const deskId = carrier.deskId

        if (equipmentsIds && equipmentsIds.length > 0) {
            app.db('desks_equipments').where({ deskId }).del().then(
                rowsDeleted => {
                    const rows = getDesksEquipmentsToInsert(deskId, equipmentsIds)
                    const chunkSize = rows.length
                    app.db.batchInsert('desks_equipments', rows, chunkSize)
                        .then(_ => resolve(carrier))
                        .catch(err => reject(err))

                    resolve(carrier)
                }
            ).catch(err => reject(err))
        } else {
            resolve(carrier)
        }
    })

    const save = (req, res) => {
        validate(req, res)
            .then(saveDesk)
            .then(analyzeEquipments)
            .then(insertEquipments)
            .then(updateEquipments)
            .then(insertDesksEquipments)
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json({ errors: [err] }))
    }

    const getNotEmptyEquipments = (equipments) => {
        return equipments.reduce((notEmptyEquipments, equipment) => {
            const keys = Object.keys(equipment)
            if (keys.length > 0 && equipment.type && equipment.patrimony) {
                notEmptyEquipments.push(equipment)
            }
            return notEmptyEquipments
        }, [])
    }

    const remove = (req, res) => {
        const deskId = req.params.id
        try {
            existsOrError(deskId, "Desk id was not informed!")

            app.db('desks_equipments').where({ deskId }).del().then(
                equipmentsDeleted => {
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
                if (desk.equipmentType && desk.equipmentSpecification) {
                    desksList[index].equipments.push({ name: desk.equipmentType, specification: desk.equipmentSpecification, patrimony: desk.equipmentPatrimony, expirationDate: getFormatedDate(desk.equipmentExpirationDate) })
                }
            } else {
                if (desk.equipmentType && desk.equipmentSpecification) {
                    desk.equipments = [{ name: desk.equipmentType, specification: desk.equipmentSpecification, patrimony: desk.equipmentPatrimony, expirationDate: getFormatedDate(desk.equipmentExpirationDate) }]
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
                equipmentType: 'equipments.type',
                equipmentSpecification: 'equipments.specification',
                equipmentPatrimony: 'equipments.patrimony',
                equipmentExpirationDate: 'equipments.expirationDate'
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('desks_equipments', 'desks_equipments.deskId', 'desks.id')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
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
                roomId: 'rooms.id',
                room: 'rooms.name',
                id: 'desks.id',
                chairDirection: 'desks.chairDirection',
                x: 'desks.x',
                y: 'desks.y',
                equipmentType: 'equipments.type',
                equipmentSpecification: 'equipments.specification'
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('desks_equipments', 'desks_equipments.deskId', 'desks.id')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
            .where({ 'desks.userId': req.decoded.id, 'rooms.id': req.params.id })
            .orderBy('desks.created_at', 'desc')
            .then(desks => {
                res.json(getDesksWithEquipments(desks))
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
                equipmentType: 'equipments.type',
                equipmentSpecification: 'equipments.specification',
                equipmentPatrimony: 'equipments.patrimony',
                equipmentExpirationDate: 'equipments.expirationDate'
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('desks_equipments', 'desks_equipments.deskId', 'desks.id')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
            .where({ 'desks.id': req.params.id })
            .then(desks => res.json(getDesksWithEquipments(desks)[0]))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getEquipments = (req, res) => {
        app.db.select(
            {
                id: 'desks_equipments.id',
                deskId: 'desks_equipments.deskId',
                type: 'equipments.type',
                specification: 'equipments.specification',
                patrimony: 'equipments.patrimony',
                expirationDate: 'equipments.expirationDate'
            }
        ).from('desks_equipments')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
            .where({ 'desks_equipments.deskId': req.params.id })
            .then(equipments => res.json(equipments))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getEquipmentsToInsert = (equipments, userId) => {
        return equipments.reduce((rows, equipment) => {

            rows.push({
                type: equipment.type,
                patrimony: equipment.patrimony,
                userId 
            })
            return rows
        }, [])
    }

    const getEquipmentsToUpdate = equipments => {
        return equipments.reduce((rows, equipment) => {
            rows.push({
                id: equipment.id,
                type: equipment.type,
                patrimony: equipment.patrimony,
                userId
            })

            return rows
        }, [])
    }

    const getDesksEquipmentsToInsert = (deskId, equipmentsIds) => {
        return equipmentsIds.reduce((rows, equipmentId) => {
            rows.push({
                deskId,
                equipmentId
            })
            return rows
        }, [])
    }


    return { save, remove, get, getById, getEquipments, getOfficeData }
}