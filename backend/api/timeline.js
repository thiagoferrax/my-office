const { array2map } = require('../common/mapUtil')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const buildTimeline = (timelineData, type, entities) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

        return entities.reduce((data, entity) => {
            const time = entity.time
            const date = time.toLocaleDateString('en-US', options)
            if (!data[date]) {
                data[date] = []
            }
            data[date].push({
                type,
                data: {
                    ...entity,
                    time,
                    formattedTime: time.toLocaleTimeString('en-US')
                }
            })
            return data
        }, timelineData)
    }

    const buildUserName = (entityMap, usersMap, loggedUser) => {
        const ids = Object.keys(entityMap)
        ids.forEach(id => {
            const userId = entityMap[id].userId
            if (usersMap[userId]) {
                const user = usersMap[userId].user
                entityMap[id] = { ...entityMap[id], user }
            } else if (loggedUser.id === userId) {
                const user = loggedUser.user
                entityMap[id] = { ...entityMap[id], user }
            }
        })
    }

    const getRoomsIds = (summary) => new Promise((resolve, reject) => {
        const userId = summary.userId

        app.db.select({
            id: 'rooms.id',
        }).from('rooms')
            .leftJoin('teams', 'teams.roomId', 'rooms.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .where({ 'rooms.userId': userId })
            .orWhere({ 'users.id': userId })
            .then(rooms => {
                const roomsMap = array2map(rooms, 'id')
                summary.roomsIds = Object.keys(roomsMap)
                resolve(summary)
            })
            .catch(err => reject(err))
    })

    const getTeam = rooms => {
        const distinctUsers = {}
        return rooms && rooms.reduce((users, member) => {
            if (!distinctUsers[member.memberId]) {
                distinctUsers[member.memberId] = 1
                users.push({ userId: member.memberId, user: member.memberName, time: member.memberTime })
            }
            return users
        }, [])
    }

    const getRooms = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'rooms.id',
            room: 'rooms.name',
            userId: 'rooms.userId',
            time: 'rooms.created_at',
            memberId: 'users.id',
            memberName: 'users.name',
            memberTime: 'users.created_at'
        }).from('rooms')
            .leftJoin('teams', 'teams.roomId', 'rooms.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .whereIn('rooms.id', summary.roomsIds)
            .then(rooms => {
                if (rooms.length > 0) {
                    summary.team = getTeam(rooms)

                    summary.timeline.data = buildTimeline(summary.timeline.data, 'user', summary.team)
                    summary.usersMap = array2map(summary.team, 'userId')
                    summary.membersIds = Object.keys(summary.usersMap)

                    const roomsMap = array2map(rooms, 'id')
                    buildUserName(roomsMap, summary.usersMap, summary.user)

                    summary.roomsIds = Object.keys(roomsMap)
                    summary.rooms = Object.values(roomsMap)
                    summary.timeline.data = buildTimeline(summary.timeline.data, 'room', summary.rooms)
                }

                resolve(summary)
            })
            .catch(err => reject(err))
    })

    const getEmployees = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'employees.id',
            employee: 'employees.description',
            user: 'users.name',
            time: 'employees.created_at',
        }).from('employees')
            .leftJoin('users', 'employees.userId', 'users.id')
            .whereIn('employees.userId', summary.membersIds)
            .where('employees.parentId', null)
            .then(employees => {
                summary.timeline.data = buildTimeline(summary.timeline.data, 'employee', employees)
                resolve(summary)
            }).catch(err => reject(err))
    })

    const getDesks = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'desks.id',
            room: 'rooms.name',
            user: 'users.name',
            time: 'desks.created_at',
        }).from('desks')
            .leftJoin('rooms', 'desks.roomId', 'rooms.id')
            .leftJoin('users', 'desks.userId', 'users.id')
            .whereIn('desks.roomId', summary.roomsIds)
            .then(desks => {
                summary.timeline.data = buildTimeline(summary.timeline.data, 'desk', desks)
                resolve(summary)
            }).catch(err => reject(err))
    })

    const getLoggedUser = (summary) => new Promise((resolve, reject) => {
        app.db.select({
            id: 'users.id',
            user: 'users.name',
            time: 'users.created_at'
        }).from('users')
            .where('users.id', summary.userId)
            .first()
            .then(user => {
                summary.user = user
                resolve(summary)
            }).catch(err => reject(err))
    })

    const getSingleUser = (summary) => new Promise((resolve, reject) => {
        if (Object.keys(summary.rooms).length < 1 || !summary.membersIds.includes(`${summary.userId}`) ) {
            summary.timeline.data = buildTimeline(summary.timeline.data, 'user', [summary.user])
        }
        resolve(summary)        
    })

    const get = (req, res) => {
        const userId = req.decoded.id
        const summary = { timeline: { data: {} }, userId, membersIds: [userId], rooms: [] }

        getLoggedUser(summary)
            .then(getRoomsIds)
            .then(getRooms)
            .then(getDesks)
            .then(getSingleUser)
            .then(summary => res.json(summary.timeline))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    return { get }
}