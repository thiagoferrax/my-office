const { array2map } = require('../common/mapUtil')

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const employee = {
            id: req.body.id,
            description: req.body.description,
            parentId: req.body.parentId,
            userId: req.decoded.id
        }

        if (req.params.id) employee.id = req.params.id

        try {
            existsOrError(employee.description, 'Item description was not informed!')
            existsOrError(employee.userId, 'User was not informed!')

        } catch (msg) {
            return res.status(400).json({ errors: [msg] })
        }

        if (employee.id) {
            if (employee.parentId) {
                if (+employee.id === +employee.parentId) {
                    res.status(400).json({ errors: ['Circular reference is not permitted!'] })
                } else {
                    app.db('employees').then(employees => withPath(employees)).then(tree => {
                        const parentIds = tree.filter(c => c.id === employee.parentId)[0].parentPathIds
                        if (parentIds.includes(+employee.id)) {
                            res.status(400).json({ errors: ['Circular reference is not permitted!'] })
                        } else {
                            update(req, res)
                        }
                    })
                }
            } else {
                update(req, res)
            }
        } else {
            employee.created_at = new Date()
            employee.updated_at = null

            app.db('employees')
                .insert(employee, 'id')
                .then(id => res.json({ ...employee, id: Number(id[0]) }))
                .catch(err => res.status(500).json({ errors: [err] }))
        }
    }

    const update = (req, res) => {
        const employee = {
            id: req.body.id,
            description: req.body.description,
            parentId: req.body.parentId,
        }

        if (req.params.id) employee.id = req.params.id

        employee.updated_at = new Date()

        app.db('employees')
            .update(employee)
            .where({ id: employee.id })
            .then(id => res.json({ ...employee, id: Number(employee.id) }))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, "Employee id was not informed!")

            const subEmployees = await app.db('employees').where({ parentId: req.params.id })

            notExistsOrError(subEmployees, "This employee has items!")

            const desks = await app.db('desks').where({ employeeId: req.params.id })

            notExistsOrError(desks, "There are desks with this employee!")

            const rowsDeleted = await app.db('employees').where({ id: req.params.id }).del()

            existsOrError(rowsDeleted, "Employee was not found!")

            res.status(204).send()
        } catch (msg) {
            res.status(400).json({ errors: [msg] })
        }
    }

    const withPath = employees => {
        const getParent = (employees, parentId) => {
            const parent = employees.filter(parent => parent.id === parentId)
            return parent.length ? parent[0] : null
        }

        const employeesWithPath = employees.map(employee => {
            let path = employee.description
            const parentPathIds = []
            let parentPath = ''
            let parent = getParent(employees, employee.parentId)

            while (parent) {
                path = `${parent.description} > ${path}`
                parentPath = parentPath ? `${parent.description} > ${parentPath}` : parent.description
                parentPathIds.push(parent.id)
                parent = getParent(employees, parent.parentId)
            }

            return { ...employee, path, parentPath, parentPathIds }
        })

        employeesWithPath.sort((a, b) => {
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })
        return employeesWithPath
    }

    const getProjectsIds = (userId) => new Promise((resolve, reject) => {
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
            .then(employees => resolve(withPath(employees)))
            .catch(err => reject(err))
    })

    const removeItemsWithoutRoot = (employees) => new Promise((resolve, reject) => {
        const getNewList = (tree, initialList = []) => {
            return tree && tree.reduce((newList, employee) => {
                newList.push(employee)
                return getNewList(employee.children, newList)
            }, initialList)
        }

        const itemsWithRoot = toTree(employees)
        const newList = getNewList(itemsWithRoot)

        resolve(newList)
    })

    const get = (req, res) => {
        return getProjectsIds(req.decoded.id)
            .then(getMembersIds)
            .then(getEmployees)
            .then(removeItemsWithoutRoot)
            .then(employees => res.json(withPath(employees)))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getById = (req, res) => {
        app.db('employees')
            .where({ id: req.params.id })
            .first()
            .then(employee => res.json(employee))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const toTree = (employees, tree) => {
        if (!tree) tree = employees.filter(c => !c.parentId)
        tree = tree.map(parentNode => {
            const isChild = node => node.parentId === parentNode.id
            parentNode.children = toTree(employees, employees.filter(isChild))
            return parentNode
        })
        return tree
    }

    const getTree = (req, res) => {
        return getProjectsIds(req.decoded.id)
            .then(getMembersIds)
            .then(getEmployees)
            .then(employees => res.json(toTree(employees)))
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const clone = (req, res) => {
        const employee = req.body.employee

        try {
            existsOrError(employee, 'Parent path was not informed!')

            employee.description += ' (NEW)'
            saveEmployee(employee, employee.parentId, res)

            res.status(204).send()
        } catch (msg) {
            res.status(400).json({ errors: [msg] })
        }
    }

    const saveEmployee = (item, parentId, res) => {

        item.parentId = parentId

        const children = item.children

        delete item.id
        delete item.children

        app.db('employees').insert(item, 'id').then(newId => {
            if (children) {
                children.forEach(child => {
                    saveEmployee(child, newId[0], res)
                })
            }
        })
            .catch(err => res.status(500).json({ errors: [err] }))
    }

    const getEmployeesToInsert = (employee, initialEmployees = []) => {
        return employee.reduce((employees, item) => {
            employees.push({ description: item.description, parentId: item.parentId })
            return getEmployeesToInsert(item.children, employees)
        }, initialEmployees)
    }

    return { save, remove, get, getById, getTree, clone }
}