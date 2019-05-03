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
            employees: req.body.employees,
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
        const employees = getNotEmptyEmployees(desk.employees || [])

        carrier.equipments = equipments
        carrier.employees = employees

        delete desk.equipments
        delete desk.employees

        if (!desk.id) {
            desk.created_at = new Date()
            desk.updated_at = null

            app.db('desks')
                .insert(desk)
                .returning('id')
                .then(deskId => {
                    carrier.deskId = deskId[0]
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
                    resolve(carrier)
                })
                .catch(err => reject(err))
        }
    })

    const analyzeEquipments = (carrier) => new Promise((resolve, reject) => {

        const equipments = carrier.equipments

        if (equipments && equipments.length > 0) {
            const patrimoniesMap = equipments.map(equipment => ({
                patrimony: +equipment.patrimony, equipment
            }))

            const patrimonies = patrimoniesMap.map(p => p.patrimony)

            app.db('equipments').whereIn('patrimony', patrimonies)
                .then(equipmentsFound => {
                    const equipmentsToUpdate = equipmentsFound.map(e => ({ ...e, ...patrimoniesMap[e.patrimony] }))
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

    const analyzeEmployees = (carrier) => new Promise((resolve, reject) => {

        const employees = carrier.employees

        if (employees && employees.length > 0) {
            const identifiers = employees.map(employee => ({
                identifier: employee.identifier, employee
            }))
            app.db('employees').whereIn('identifier', identifiers.map(i => i.identifier))
                .then(employeesFound => {
                    const employeesToUpdate = employeesFound.map(e => ({ ...e, ...identifiers[e.identifier] }))
                    const identifiersFound = employeesFound.map(e => e.identifier)
                    const employeesToInsert = employees.filter(e => !identifiersFound.includes(e.identifier))

                    carrier.employeesToUpdate = employeesToUpdate
                    carrier.employeesToInsert = employeesToInsert

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
                    reject(err)
                })
        } else {
            resolve(carrier)
        }
    })

    const insertEmployees = (carrier) => new Promise((resolve, reject) => {
        const employees = carrier.employeesToInsert
        const userId = carrier.userId

        if (employees && employees.length > 0) {
            const rows = getEmployeesToInsert(employees, userId)

            const chunkSize = rows.length

            app.db.batchInsert('employees', rows, chunkSize)
                .returning('id')
                .then(ids => {
                    carrier.employeesIds = ids
                    resolve(carrier)
                })
                .catch(err => {
                    reject(err)
                })
        } else {
            resolve(carrier)
        }
    })

    const updateEquipments = (carrier) => new Promise((resolve, reject) => {
        const equipments = carrier.equipmentsToUpdate
        if (equipments && equipments.length > 0) {
            carrier.equipmentsIds = (carrier.equipmentsIds || []).concat(equipments.map(e => e.id))
        }
        resolve(carrier)
    })

    const updateEmployees = (carrier) => new Promise((resolve, reject) => {
        const employees = carrier.employeesToUpdate

        if (employees && employees.length > 0) {
            carrier.employeesIds = (carrier.employeesIds || []).concat(employees.map(e => e.id))
        }
        resolve(carrier)
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
                        .catch(err => {
                            reject(err)
                        })

                    resolve(carrier)
                }
            ).catch(err => {
                reject(err)
            })
        } else {
            resolve(carrier)
        }
    })

    const insertDesksEmployees = (carrier) => new Promise((resolve, reject) => {
        const employeesIds = carrier.employeesIds
        const deskId = carrier.deskId

        if (employeesIds && employeesIds.length > 0) {
            app.db('desks_employees').where({ deskId }).del().then(
                rowsDeleted => {
                    const rows = getDesksEmployeesToInsert(deskId, employeesIds)
                    const chunkSize = rows.length
                    app.db.batchInsert('desks_employees', rows, chunkSize)
                        .then(_ => resolve(carrier))
                        .catch(err => {
                            reject(err)
                        })
                }
            ).catch(err => {
                reject(err)
            })
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
            .then(analyzeEmployees)
            .then(insertEmployees)
            .then(updateEmployees)
            .then(insertDesksEmployees)
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

    const getNotEmptyEmployees = (employees) => {
        return employees.reduce((notEmptyEmployees, employee) => {
            const keys = Object.keys(employee)
            if (keys.length > 0 && employee.identifier && employee.name) {
                notEmptyEmployees.push(employee)
            }
            return notEmptyEmployees
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

    const buildEquipment = (desk) => {
        return ({
            type: desk.equipmentType,
            specification: desk.equipmentSpecification,
            patrimony: desk.equipmentPatrimony,
            expirationDate: getFormatedDate(desk.equipmentExpirationDate)
        })
    }

    const buildEmployee = (desk) => {
        return ({
            name: desk.employeeName,
            identifier: desk.employeeIdentifier,
        })
    }

    const getDesksWithEquipments = (desks) => {

        const employeeMap = []
        return desks && desks.reduce((desksList, desk) => {
            const foundDesk = desksList.filter(e => e.id == desk.id)
            if (foundDesk.length > 0) {
                const index = desksList.indexOf(foundDesk[0])
                if (desk.equipmentType && desk.equipmentPatrimony) {
                    desksList[index].equipments.push(buildEquipment(desk))
                }

                if (desk.employeeName && desk.employeeIdentifier) {
                    const employee = buildEmployee(desk)
                    if(!employeeMap.includes(employee.identifier)) {
                        desksList[index].employees.push(employee)
                        employeeMap.push(employee.identifier)
                    }               
                }
            } else {
                if (desk.equipmentType && desk.equipmentPatrimony) {
                    desk.equipments = [{}, buildEquipment(desk)]
                } else {
                    desk.equipments = [{}]
                }

                if (desk.employeeName && desk.employeeIdentifier) {
                    if(!desk.employees) {
                        desk.employees = []
                    }
                    const employee = buildEmployee(desk) 
                    if(!employeeMap.includes(employee.identifier)) {
                        desk.employees.push(employee)
                        employeeMap.push(employee.identifier)
                    }                    
                } else {
                    desk.employees = [{}]
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
                equipmentExpirationDate: 'equipments.expirationDate',
                employeeName: 'employees.name',
                employeeIdentifier: 'employees.identifier',
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('desks_equipments', 'desks_equipments.deskId', 'desks.id')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
            .leftJoin('desks_employees', 'desks_employees.deskId', 'desks.id')
            .leftJoin('employees', 'desks_employees.employeeId', 'employees.id')
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
                equipmentSpecification: 'equipments.specification',
                equipmentPatrimony: 'equipments.patrimony',
                equipmentExpirationDate: 'equipments.expirationDate',
                employeeName: 'employees.name',
                employeeIdentifier: 'employees.identifier',
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('desks_equipments', 'desks_equipments.deskId', 'desks.id')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
            .leftJoin('desks_employees', 'desks_employees.deskId', 'desks.id')
            .leftJoin('employees', 'desks_employees.employeeId', 'employees.id')
            .where({ 'desks.userId': req.decoded.id, 'rooms.id': req.params.id })
            .orderBy('desks.created_at', 'desc')
            .then(desks => {
                const desksWithEquipments = getDesksWithEquipments(desks)

                res.json(desksWithEquipments)
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
                equipmentExpirationDate: 'equipments.expirationDate',
                employeeName: 'employees.name',
                employeeIdentifier: 'employees.identifier',
            }
        ).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('desks_equipments', 'desks_equipments.deskId', 'desks.id')
            .leftJoin('equipments', 'desks_equipments.equipmentId', 'equipments.id')
            .leftJoin('desks_employees', 'desks_employees.deskId', 'desks.id')
            .leftJoin('employees', 'desks_employees.employeeId', 'employees.id')
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
                userId,
                created_at: new Date()
            })
            return rows
        }, [])
    }

    const getEquipmentsToUpdate = (equipments, userId) => {
        return equipments.reduce((rows, equipment) => {
            rows.push({
                id: equipment.id,
                type: equipment.type,
                patrimony: equipment.patrimony,
                userId,
                updated_at: new Date()
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

    const getEmployeesToInsert = (employees, userId) => {
        return employees.reduce((rows, employee) => {

            rows.push({
                identifier: employee.identifier,
                name: employee.name,
                userId,
                created_at: new Date()
            })
            return rows
        }, [])
    }

    const getEmployeesToUpdate = employees => {
        return employees.reduce((rows, employee) => {
            rows.push({
                id: employee.id,
                identifier: employee.identifier,
                name: employee.name,
                userId,
                updated_at: new Date()
            })

            return rows
        }, [])
    }

    const getDesksEmployeesToInsert = (deskId, employeesIds) => {
        return employeesIds.reduce((rows, employeeId) => {
            rows.push({
                deskId,
                employeeId
            })
            return rows
        }, [])
    }


    return { save, remove, get, getById, getEquipments, getOfficeData }
}