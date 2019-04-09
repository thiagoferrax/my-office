module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const room = {
            id: req.body.id,
            name: req.body.name,
            team: req.body.team,
            userId: req.decoded.id,
        }

        if (req.params.id) room.id = req.params.id

        try {
            existsOrError(room.name, 'Name was not informed!')
            existsOrError(room.userId, 'User was not informed!')
            existsOrError(room.team, 'Team was not informed!')
        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        const team = room.team
        delete room.team

        if (room.id) {
            delete room.userId
            room.updated_at = new Date()

            app.db('rooms')
                .update(room)
                .where({ id: room.id })
                .then(_ => {
                    if (team && team.length > 0) {
                        updateTeam(room.id, team, res)
                    } else {
                        res.status(204).send()
                    }
                })
                .catch(err => res.status(500).json({ errors: [err] }))
        } else {
            room.created_at = new Date()
            room.updated_at = null
            
            app.db('rooms')
                .insert(room)
                .returning('id')
                .then(roomId => insertTeam(roomId[0], team, res))
                .catch(err => res.status(500).json({ errors: [err] }))
        }
    }

    const updateTeam = (roomId, team, res) => {
        app.db('teams').where({ roomId: roomId }).del().then(
            rowsDeleted => {
                insertTeam(roomId, team, res)
            }
        )
    }

    const insertTeam = (roomId, team, res) => {
        const rows = getTeamToInsert(roomId, team)

        const chunkSize = rows.lenght
        app.db.batchInsert('teams', rows, chunkSize)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getTeamToInsert = (roomId, team, initialTeam = []) => {
        return team.reduce((users, userId) => {
            users.push({ roomId, userId })
            return users
        }, initialTeam)
    }

    const remove = async (req, res) => {
        try {
            const roomId = req.params.id

            existsOrError(roomId, "Room id was not informed!")

            const desks = await app.db('desks').where({ roomId })

            notExistsOrError(desks, "The room has desks!")

            app.db('teams').where({ roomId }).del().then(
                teamDeleted => {
                    app.db('rooms').where({ id: roomId }).del().then(rowsDeleted => {
                        existsOrError(rowsDeleted, "Room was not found!")
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
                id: 'rooms.id',
                name: 'rooms.name',
                userId: 'rooms.userId',
                date: 'rooms.created_at'
            }
        ).from('rooms')
            .leftJoin('teams', 'teams.roomId', 'rooms.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .where({ 'rooms.userId': userId }).orWhere({ 'users.id': userId })
            .then(rooms => {

                const roomsMap = rooms.reduce((map, room) => {
                    map[room.id] = room
                    return map
                }, {})

                const sortedRooms = Object.values(roomsMap).sort((a, b) => {return new Date(b.date) - new Date(a.date)})

                res.json(sortedRooms)
            })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getById = (req, res) => {
        app.db.select(
            {
                id: 'rooms.id',
                name: 'rooms.name',
                userId: 'rooms.userId',
                memberId: 'users.id'
            }
        ).from('rooms')
            .leftJoin('teams', 'teams.roomId', 'rooms.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .where({ 'rooms.id': req.params.id })
            .then(roomTeam => {
                let room = {
                    id: roomTeam[0].id,
                    name: roomTeam[0].name,
                    userId: roomTeam[0].userId,
                    team: []
                }

                room.team = roomTeam.reduce((team, member) => {
                    team.push(member.memberId)
                    return team
                }, [])

                res.json(room)
            })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    return { save, remove, get, getById }
}