const { array2map } = require('../common/mapUtil')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const getProjects = (userId) => new Promise((resolve, reject) => {
        const summary = { projects: 0, evaluations: 0, number_evaluations: 0, members: 0, comments: 0, userId }

        app.db.select({
            id: 'projects.id',
            name: 'projects.name',
            userId: 'projects.userId',
            memberId: 'users.id'
        }).from('projects')
            .leftJoin('teams', 'teams.projectId', 'projects.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .where({ 'projects.userId': userId })
            .orWhere({ 'users.id': userId })
            .then(projects => {
                const projectsMap = array2map(projects, 'id')
                summary.projectsIds = Object.keys(projectsMap)
                summary.projects = Object.values(projectsMap)

                resolve(summary)
            })
            .catch(err => reject(err))
    })

    const getTeam = (summary) => new Promise((resolve, reject) => {
        app.db('teams').distinct('userId')
            .whereIn('projectId', summary.projectsIds)
            .then(members => {
                summary.members = members.map(member => ({
                    userId: member.userId,
                    projectId: member.projectId
                }
                ))

                resolve(summary)
            })
            .catch(err => reject(err))
    })

    const getEvaluations = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'evaluations.id',
            projectId: 'evaluations.projectId',
            room: 'projects.name',
            chairPosition: 'evaluations.chairDirection',
            x: 'evaluations.x',
            y: 'evaluations.y',
            userId: 'evaluations.userId',
            date: 'evaluations.created_at',
            equipmentName: 'answers.name',
            equipmentSpecification: 'answers.specification'
        }).from('evaluations')
            .leftJoin('projects', 'evaluations.projectId', 'projects.id')
            .leftJoin('answers', 'answers.evaluationId', 'evaluations.id')               
            .whereIn('evaluations.projectId', summary.projectsIds)
            .then(evaluations => {
                let number_evaluations = 0
                summary.officeData = evaluations && evaluations.reduce((data, evaluation) => {
                    const room = evaluation.projectId

                    if(!Object.keys(data).includes(`${room}`)) {
                        data[room] = []
                    }

                    const foundEvaluation = data[room].filter(e => e.id == evaluation.id)
                    if(foundEvaluation.length > 0) {
                        const index = data[room].indexOf(foundEvaluation[0])
                        if(evaluation.equipmentName && evaluation.equipmentSpecification) {
                            data[room][index].equipments[evaluation.equipmentName] = evaluation.equipmentSpecification
                        }
                    } else {
                        evaluation.equipments = {}
                        if(evaluation.equipmentName && evaluation.equipmentSpecification) {
                            evaluation.equipments[evaluation.equipmentName] = evaluation.equipmentSpecification
                        }
                        data[room].push({ ...evaluation })
                        number_evaluations++    
                    }

                    return data                
                }, {}) 
                summary.number_evaluations = number_evaluations
                resolve(summary)
            }).catch(err => reject(err))
    })

    const get = (req, res) => {
        const userId = req.decoded.id

        getProjects(userId)
            .then(getTeam)
            .then(getEvaluations)
            .then(summary => res.json(summary))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    return { get }
}