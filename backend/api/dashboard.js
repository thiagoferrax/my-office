const { array2map } = require('../common/mapUtil')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const getProjects = (userId) => new Promise((resolve, reject) => {
        const summary = { rooms: 0, desks: 0, number_desks: 0, members: 0, comments: 0, userId }

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

    const getDesks = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'desks.id',
            roomId: 'desks.roomId',
            room: 'rooms.name',
            chairDirection: 'desks.chairDirection',
            x: 'desks.x',
            y: 'desks.y',
            userId: 'desks.userId',
            date: 'desks.created_at',
            equipmentName: 'answers.name',
            equipmentSpecification: 'answers.specification'
        }).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('answers', 'answers.deskId', 'desks.id')               
            .whereIn('desks.roomId', summary.roomsIds)
            .then(desks => {
                let number_desks = 0
                summary.officeData = desks && desks.reduce((data, desk) => {
                    const room = desk.roomId

                    if(!Object.keys(data).includes(`${room}`)) {
                        data[room] = []
                    }

                    const foundDesk = data[room].filter(e => e.id == desk.id)
                    if(foundDesk.length > 0) {
                        const index = data[room].indexOf(foundDesk[0])
                        if(desk.equipmentName && desk.equipmentSpecification) {
                            data[room][index].equipments.push({name:desk.equipmentName, specification: desk.equipmentSpecification})
                        }
                    } else {
                        desk.equipments = []
                        if(desk.equipmentName && desk.equipmentSpecification) {
                            desk.equipments.push({name:desk.equipmentName, specification: desk.equipmentSpecification})
                        }
                        data[room].push({ ...desk })
                        number_desks++    
                    }

                    return data                
                }, {}) 
                summary.number_desks = number_desks
                resolve(summary)
            }).catch(err => reject(err))
    })

    const get = (req, res) => {
        const userId = req.decoded.id

        getProjects(userId)
            .then(getTeam)
            .then(getDesks)
            .then(summary => res.json(summary))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    return { get }
}