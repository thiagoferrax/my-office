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
            date: 'evaluations.created_at'
        }).from('evaluations')
            .whereIn('evaluations.projectId', summary.projectsIds)
            .leftJoin('projects', 'evaluations.projectId', 'projects.id')
            .then(evaluations => {
                summary.number_evaluations = evaluations.length

                summary.officeData = evaluations && evaluations.reduce((data, evaluation) => {
                    const room = evaluation.projectId
                    console.log('data', data, room)

                    if(!Object.keys(data).includes(`${room}`)) {
                        console.log('clean....')
                        data[room] = []
                    }
                    data[room].push({ ...evaluation })    
                    return data                
                }, {}) 

                console.log('summary.officeData',  summary.officeData)

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