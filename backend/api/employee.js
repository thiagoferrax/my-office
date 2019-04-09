const { array2map } = require('../common/mapUtil')

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const employee = {
            id: req.body.id,
            name: req.body.name,
            identifier: req.body.identifier,
            email: req.body.email,
            phone: req.body.phone,
            userId: req.decoded.id
        }

        if (req.params.id) employee.id = req.params.id

        try {
            existsOrError(employee.name, 'Name was not informed!')
            existsOrError(employee.identifier, 'Identifier was not informed!')
            existsOrError(employee.userId, 'User was not informed!')
        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        if (employee.id) {
            employee.updated_at = new Date()

            app.db('employees')
                .update(employee)
                .where({ id: employee.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).json({ errors: [err] }))
        } else {

            employee.created_at = new Date()
            employee.updated_at = null

            app.db('employees')
                .insert(employee, 'id')
                .then(_ => res.status(204).send())
                .catch(err => {
                    res.status(500).json({ errors: [err] })
                })
        }
    }

    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, "Employee id was not informed!")

            //const desks = await app.db('desks').where({ employeeId: req.params.id })
            //notExistsOrError(desks, "There is a desk with this employee!")

            const rowsDeleted = await app.db('employees').where({ id: req.params.id }).del()

            existsOrError(rowsDeleted, "Employee was not found!")

            res.status(204).send()
        } catch (msg) {
            res.status(400).json({ errors: [msg] })
        }
    }

    const getRoomsIds = (userId) => new Promise((resolve, reject) => {
        let roomsIds = []
        app.db.select({
            id: 'rooms.id',
        }).from('rooms')
            .leftJoin('teams', 'teams.roomId', 'rooms.id')
            .leftJoin('users', 'teams.userId', 'users.id')
            .where({ 'rooms.userId': userId })
            .orWhere({ 'users.id': userId })
            .then(rooms => {
                if (rooms.length > 0) {
                    const roomsMap = array2map(rooms, 'id')
                    roomsIds = Object.keys(roomsMap)
                }
                resolve({ userId, roomsIds })
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

    const getMembersIds = ({ userId, roomsIds }) => new Promise((resolve, reject) => {
        let membersIds = [userId]
        if (roomsIds.length === 0) {
            resolve(membersIds)
        } else {
            app.db.select({
                id: 'rooms.id',
                memberId: 'users.id',
                memberName: 'users.name',
                memberTime: 'users.created_at'
            }).from('rooms')
                .leftJoin('teams', 'teams.roomId', 'rooms.id')
                .leftJoin('users', 'teams.userId', 'users.id')
                .whereIn('rooms.id', roomsIds)
                .then(rooms => {
                    if (rooms.length > 0) {
                        const team = getTeam(rooms)
                        const usersMap = array2map(team, 'userId')
                        membersIds = Object.keys(usersMap)
                    }

                    resolve(membersIds)
                })
                .catch(err => reject(err))
        }

    })

    const getEmployees = (membersIds) => new Promise((resolve, reject) => {
        app.db('employees')
            .whereIn('employees.userId', membersIds)
            .then(employees => resolve(employees))
            .catch(err => reject(err))
    })

    const get = (req, res) => {
        return getRoomsIds(req.decoded.id)
            .then(getMembersIds)
            .then(getEmployees)
            .then(employees => res.json(employees))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getById = (req, res) => {
        app.db('employees')
            .where({ id: req.params.id })
            .first()
            .then(employee => res.json(employee))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    return { save, remove, get, getById }
}