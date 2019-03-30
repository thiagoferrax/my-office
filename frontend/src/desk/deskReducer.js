const INITIAL_STATE = { list: [], checklist: [], tree: [], checklistId: null, score: null, completion: 0, officeData: [] }

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'EVALUATIONS_FETCHED':
            return { ...state, list: action.payload.data }
        case 'CHECKLIST_SELECTED':
            let tree = state.tree || []
            let checklist = tree.filter(checklist => checklist.id === action.payload)
            return { ...state, checklist, score: null }
        case 'OFFICE_DATA_FETCHED':
            return { ...state, officeData: action.payload.data }
        case 'TREE_FETCHED':
            return { ...state, tree: action.payload.data }
        case 'SCORE_UPDATED':
            const score =
                action.payload &&
                action.payload.filter(item => item.parentId === null)[0].value

            const getItemsQuantitative =
                (treeScore, initialItems = { total: 0, withValue: 0 }) =>
                    (treeScore && treeScore.reduce((items, item) => {
                        items.total++
                        if (item.value !== undefined) {
                            items.withValue++
                        }
                        if (item.children) {
                            return getItemsQuantitative(item.children, items)
                        }
                        return items
                    }, initialItems))

            const itemsQuantitative = getItemsQuantitative(action.payload)

            const completion = itemsQuantitative.total !== 0 ? 
                parseInt(100* itemsQuantitative.withValue / itemsQuantitative.total) : 0 

            return { ...state, score, completion }
        case 'EQUIPMENTS_FETCHED':
            let equipments = action.payload.data
            equipments = equipments.reduce((map, equipment) => {
                map[equipment.checklistId] = { value: equipment.value }
                return map
            }, {})

            let checklistWithEquipments = state.checklist
            if (equipments) {
                const refreshTree = (tree, valuesMap) => {
                    return tree.map(
                        node => {
                            const children = refreshTree(node.children, valuesMap)
                            return valuesMap.hasOwnProperty(node.id) ? { ...node, value: valuesMap[node.id].value, children } : { ...node, children }
                        })
                }

                checklistWithEquipments = refreshTree(state.checklist, equipments)
            }
            return { ...state, checklist: checklistWithEquipments }
        case 'CHECKLIST_INITIALIZED':
            return { ...state, checklist: [] }
        default:
            return state
    }
}