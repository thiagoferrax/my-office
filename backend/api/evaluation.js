module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const evaluation = {
            id: req.body.id,
            projectId: req.body.projectId,
            userId: req.decoded.id,
            equipments: req.body.equipments,
            chairDirection: req.body.chairDirection,
            x: req.body.x || 0,
            y: req.body.y || 0
        }

        if (req.params.id) evaluation.id = req.params.id

        try {
            //existsOrError(evaluation.projectId, 'Project was not informed!')
            //existsOrError(evaluation.sprint, 'Sprint was not informed!')
            //existsOrError(evaluation.checklistId, 'Checklist was not informed!')
            existsOrError(evaluation.userId, 'User was not informed!')
        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        const equipments = evaluation.equipments
        equipments && Object.keys(equipments[0]).length === 0 && equipments.shift()
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
                existsOrError(equipments, 'You need to inform the equipments!')

                evaluation.created_at = new Date()
                evaluation.updated_at = null

                app.db('evaluations')
                    .insert(evaluation)
                    .returning('id')
                    .then(evaluationId => insertEquipments(evaluationId[0], equipments, res))
                    .catch(err => {
                        res.status(500).json({ errors: [err] })
                    })
            } catch (msg) {
                return res.status(400).json({ errors: [msg] })
            }
        }
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
                evaluationsList[index].equipments.push({ name: evaluation.equipmentName, specification: evaluation.equipmentSpecification })
            } else {
                evaluation.equipments = [{ name: evaluation.equipmentName, specification: evaluation.equipmentSpecification }]
                evaluationsList.push({ ...evaluation })
            }
            return evaluationsList
        }, [])
    }

    const get = (req, res) => {
        app.db.select(
            {
                id: 'evaluations.id',
                projectId: 'evaluations.projectId',
                userId: 'evaluations.userId',
                date: 'evaluations.created_at',
                projectName: 'projects.name',
                chairDirection: 'evaluations.chairDirection',
                x: 'evaluations.x',
                y: 'evaluations.y',
                equipmentName: 'answers.name',
                equipmentSpecification: 'answers.specification'
            }
        ).from('evaluations')
            .leftJoin('projects', 'evaluations.projectId', 'projects.id')
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
                room: 'projects.name',
                id: 'evaluations.id',
                chairPosition: 'evaluations.chairDirection',
                x: 'evaluations.x',
                y: 'evaluations.y',
            }
        ).from('evaluations')
            .leftJoin('projects', 'evaluations.projectId', 'projects.id')
            .where({ 'evaluations.userId': req.decoded.id, 'projects.id': req.params.id })
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
                room: 'projects.name',
                projectId: 'projects.id',
                id: 'evaluations.id',
                chairDirection: 'evaluations.chairDirection',
                x: 'evaluations.x',
                y: 'evaluations.y',
                equipmentName: 'answers.name',
                equipmentSpecification: 'answers.specification'
            }
        ).from('evaluations')
            .leftJoin('projects', 'evaluations.projectId', 'projects.id')
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