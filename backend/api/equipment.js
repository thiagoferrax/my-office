module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const equipment = {
            id: req.body.id,
            patrimony: req.body.patrimony,
            type: req.body.type,
            specification: req.body.specification,
            expirationDate: req.body.expirationDate,
            userId: req.decoded.id,
        }

        if (req.params.id) equipment.id = req.params.id

        try {
            existsOrError(equipment.patrimony, 'Patrimony was not informed!')
            existsOrError(equipment.type, 'Type was not informed!')
            existsOrError(equipment.userId, 'User was not informed!')
        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        if (equipment.id) {
            delete equipment.userId
            equipment.updated_at = new Date()

            app.db('equipments')
                .update(equipment)
                .where({ id: equipment.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).json({ errors: [err] }))
        } else {
            equipment.created_at = new Date()
            equipment.updated_at = null

            app.db('equipments')
                .insert(equipment)
                .returning('id')
                .then(_ => res.status(204).send())
                .catch(err => {
                    res.status(500).json({ errors: [err] })})
        }
    }

    const updateTeam = (equipmentId, team, res) => {
        app.db('teams').where({ equipmentId: equipmentId }).del().then(
            rowsDeleted => {
                insertTeam(equipmentId, team, res)
            }
        )
    }

    const insertTeam = (equipmentId, team, res) => {
        const rows = getTeamToInsert(equipmentId, team)

        const chunkSize = rows.lenght
        app.db.batchInsert('teams', rows, chunkSize)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getTeamToInsert = (equipmentId, team, initialTeam = []) => {
        return team.reduce((users, userId) => {
            users.push({ equipmentId, userId })
            return users
        }, initialTeam)
    }

    const remove = async (req, res) => {
        try {
            const equipmentId = req.params.id

            existsOrError(equipmentId, "Equipment id was not informed!")

            const evaluations = await app.db('evaluations').where({ equipmentId })

            notExistsOrError(evaluations, "The equipment has evaluations!")

            app.db('teams').where({ equipmentId }).del().then(
                teamDeleted => {
                    app.db('equipments').where({ id: equipmentId }).del().then(rowsDeleted => {
                        existsOrError(rowsDeleted, "Equipment was not found!")
                        res.status(204).send()
                    })
                })
        } catch (msg) {
            res.status(400).json({ errors: [msg] })
        }
    }

    const get = (req, res) => {
        const userId = req.decoded.id

        app.db.select(
            {
                id: 'equipments.id',
                patrimony: 'equipments.patrimony',
                type: 'equipments.type',
                specification: 'equipments.specification',
                expirationDate: 'equipments.expirationDate',
                userId: 'equipments.userId',
                date: 'equipments.created_at'
            }
        ).from('equipments')
            .leftJoin('users', 'equipments.userId', 'users.id')
            .where({ 'equipments.userId': userId }).orWhere({ 'users.id': userId })
            .then(equipments => {
                const equipmentsMap = equipments.reduce((map, equipment) => {
                    map[equipment.id] = equipment
                    return map
                }, {})

                const sortedEquipments = Object.values(equipmentsMap).sort((a, b) => {return new Date(b.date) - new Date(a.date)})

                res.json(sortedEquipments)
            })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getById = (req, res) => {
        const userId = req.decoded.id

        app.db.select(
            {
                id: 'equipments.id',
                patrimony: 'equipments.patrimony',
                type: 'equipments.type',
                specification: 'equipments.specification',
                expirationDate: 'equipments.expirationDate',
                userId: 'equipments.userId',
                date: 'equipments.created_at'
            }
        ).from('equipments')
            .leftJoin('users', 'equipments.userId', 'users.id')
            .where({ 'equipments.id': req.params.id }).andWhere({ 'equipments.userId': userId })
            .then(equipments => res.json(equipments[0]))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    return { save, remove, get, getById }
}