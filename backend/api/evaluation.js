module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const evaluation = {
            id: req.body.id,
            roomId: req.body.roomId,
            userId: req.decoded.id,
            equipments: req.body.equipments,
            chairDirection: req.body.chairDirection,
            x: req.body.x || 0,
            y: req.body.y || 0
        }

        if (req.params.id) evaluation.id = req.params.id

        try {
            existsOrError(evaluation.roomId, 'Room was not informed!')
            existsOrError(evaluation.chairDirection, 'Chair direction was not informed!')
            existsOrError(evaluation.userId, 'User was not informed!')
        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        const equipments = getNotEmptyEquipments(evaluation.equipments || [])
        delete evaluation.equipments

        if (evaluation.id) {
            evaluation.updated_at = new Date()

            app.db('evaluations')
                .update(evaluation)
                .where({ id: evaluation.id })
                .then(_ => {
                    if (equipments && equipments.length > 0) {
                        updateEquipments(evaluation.id, equipments, res)
                    } else {
                        res.status(204).send()
                    }
                })
                .catch(err => res.status(500).json({ errors: [err] }))


        } else {

            try {
                evaluation.created_at = new Date()
                evaluation.updated_at = null

                app.db('evaluations')
                    .insert(evaluation)
                    .returning('id')
                    .then(evaluationId => {
                        if (equipments && equipments.length > 0) {    
                            insertEquipments(evaluationId[0], equipments, res)
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

    const updateEquipments = (evaluationId, equipments, res) => {
        app.db('answers').where({ evaluationId: evaluationId }).del().then(
            rowsDeleted => {
                insertEquipments(evaluationId, equipments, res)
            }
        )
    }

    const insertEquipments = (evaluationId, equipments, res) => {
        const rows = getEquipmentsToInsert(evaluationId, equipments)
        const chunkSize = rows.lenght
        app.db.batchInsert('answers', rows, chunkSize)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const remove = (req, res) => {
        const evaluationId = req.params.id
        try {
            existsOrError(evaluationId, "Evaluation id was not informed!")

            app.db('answers').where({ evaluationId }).del().then(
                answersDeleted => {
                    app.db('evaluations').where({ id: evaluationId }).del().then(
                        rowsDeleted => {
                            existsOrError(rowsDeleted, "Evaluation was not found!")
                            res.status(204).send()
                        }
                    ).catch(err => res.status(500).json({ errors: [err] }))
                }
            )
        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    const getEvaluationsWithEquipments = (evaluations) => {
        return evaluations && evaluations.reduce((evaluationsList, evaluation) => {
            const foundEvaluation = evaluationsList.filter(e => e.id == evaluation.id)
            if (foundEvaluation.length > 0) {
                const index = evaluationsList.indexOf(foundEvaluation[0])
                if(evaluation.equipmentName &&  evaluation.equipmentSpecification) {
                    evaluationsList[index].equipments.push({ name: evaluation.equipmentName, specification: evaluation.equipmentSpecification })
                }
            } else {
                if(evaluation.equipmentName &&  evaluation.equipmentSpecification) {
                    evaluation.equipments = [{ name: evaluation.equipmentName, specification: evaluation.equipmentSpecification }]
                } else {
                    evaluation.equipments = [{}]
                }
                evaluationsList.push({ ...evaluation })
            }
            return evaluationsList
        }, [])
    }

    const get = (req, res) => {
        app.db.select(
            {
                id: 'evaluations.id',
                roomId: 'evaluations.roomId',
                userId: 'evaluations.userId',
                date: 'evaluations.created_at',
                roomName: 'rooms.name',
                chairDirection: 'evaluations.chairDirection',
                x: 'evaluations.x',
                y: 'evaluations.y',
                equipmentName: 'answers.name',
                equipmentSpecification: 'answers.specification'
            }
        ).from('evaluations')
            .leftJoin('rooms', 'evaluations.roomId', 'rooms.id')
            .leftJoin('answers', 'answers.evaluationId', 'evaluations.id')
            .where({ 'evaluations.userId': req.decoded.id })
            .orderBy('evaluations.created_at', 'desc')
            .then(evaluations => {
                res.json(getEvaluationsWithEquipments(evaluations))
            })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getOfficeData = (req, res) => {
        app.db.select(
            {
                room: 'rooms.name',
                id: 'evaluations.id',
                chairPosition: 'evaluations.chairDirection',
                x: 'evaluations.x',
                y: 'evaluations.y',
            }
        ).from('evaluations')
            .leftJoin('rooms', 'evaluations.roomId', 'rooms.id')
            .where({ 'evaluations.userId': req.decoded.id, 'rooms.id': req.params.id })
            .orderBy('evaluations.created_at', 'desc')
            .then(evaluations => {
                const officeData = evaluations && evaluations.reduce((data, evaluation) => {
                    data.push({ ...evaluation })
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
                id: 'evaluations.id',
                chairDirection: 'evaluations.chairDirection',
                x: 'evaluations.x',
                y: 'evaluations.y',
                equipmentName: 'answers.name',
                equipmentSpecification: 'answers.specification'
            }
        ).from('evaluations')
            .leftJoin('rooms', 'evaluations.roomId', 'rooms.id')
            .leftJoin('answers', 'answers.evaluationId', 'evaluations.id')
            .where({ 'evaluations.id': req.params.id })
            .then(evaluations => res.json(getEvaluationsWithEquipments(evaluations)[0]))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getAnswers = (req, res) => {
        app.db.select(
            {
                id: 'answers.id',
                evaluationId: 'answers.evaluationId',
                name: 'answers.name',
                specification: 'answers.specification',
            }
        ).from('answers')
            .where({ 'answers.evaluationId': req.params.id })
            .then(answers => res.json(answers))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getEquipmentsToInsert = (evaluationId, equipments) => {
        return equipments.reduce((rows, equipment) => {
            rows.push({ evaluationId, name: equipment.name, specification: equipment.specification })
            return rows
        }, [])
    }

    return { save, remove, get, getById, getAnswers, getOfficeData }
}