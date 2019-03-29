const { array2map } = require('../common/mapUtil')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const getProjects = (userId) => new Promise((resolve, reject) => {
        const summary = { rooms: 0, evaluations: 0, number_evaluations: 0, members: 0, comments: 0, userId }

        app.db.select({
            id: 'rooms.id',
            name: 'rooms.name',
            userId: 'rooms.userId',
            memberId: 'users.id'
        }).from('rooms')
            .leftJoin('teams', 'teams.roomId', 'rooms.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .where({ 'rooms.userId': userId })
            .orWhere({ 'users.id': userId })
            .then(rooms => {
                const roomsMap = array2map(rooms, 'id')
                summary.roomsIds = Object.keys(roomsMap)
                summary.rooms = Object.values(roomsMap)

                resolve(summary)
            })
            .catch(err => reject(err))
    })

    const getTeam = (summary) => new Promise((resolve, reject) => {
        app.db('teams').distinct('userId')
            .whereIn('roomId', summary.roomsIds)
            .then(members => {
                summary.members = members.map(member => ({
                    userId: member.userId,
                    roomId: member.roomId
                }
                ))

                resolve(summary)
            })
            .catch(err => reject(err))
    })

    const getEvaluations = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'evaluations.id',
            roomId: 'evaluations.roomId',
            room: 'rooms.name',
            chairPosition: 'evaluations.chairDirection',
            x: 'evaluations.x',
            y: 'evaluations.y',
            userId: 'evaluations.userId',
            date: 'evaluations.created_at',
            equipmentName: 'answers.name',
            equipmentSpecification: 'answers.specification'
        }).from('evaluations')
            .leftJoin('rooms', 'evaluations.roomId', 'rooms.id')
            .leftJoin('answers', 'answers.evaluationId', 'evaluations.id')               
            .whereIn('evaluations.roomId', summary.roomsIds)
            .then(evaluations => {
                let number_evaluations = 0
                summary.officeData = evaluations && evaluations.reduce((data, evaluation) => {
                    const room = evaluation.roomId

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