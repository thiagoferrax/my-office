const INITIAL_STATE = { list: [], score: null, completion: 0, officeData: [] }

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'DESKS_FETCHED':
            return { ...state, list: action.payload.data }
        case 'OFFICE_DATA_FETCHED':
            return { ...state, officeData: action.payload.data }        
        default:
            return state
    }
}