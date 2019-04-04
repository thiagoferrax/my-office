const INITIAL_STATE = { list: [], score: null, completion: 0, officeData: [] }

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'DESKS_FETCHED':
            return { ...state, list: action.payload.data }
        case 'OFFICE_DATA_FETCHED':
            return { ...state, officeData: action.payload.data }
        case 'EQUIPMENTS_FETCHED':
            let equipments = action.payload.data
            equipments = equipments.reduce((map, equipment) => {
                map[equipment.employeeId] = { value: equipment.value }
                return map
            }, {})

            let employeeWithEquipments = state.employee
            if (equipments) {
                const refreshTree = (tree, valuesMap) => {
                    return tree.map(
                        node => {
                            const children = refreshTree(node.children, valuesMap)
                            return valuesMap.hasOwnProperty(node.id) ? { ...node, value: valuesMap[node.id].value, children } : { ...node, children }
                        })
                }

                employeeWithEquipments = refreshTree(state.employee, equipments)
            }
            return { ...state, employee: employeeWithEquipments }
        default:
            return state
    }
}