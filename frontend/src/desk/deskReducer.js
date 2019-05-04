const INITIAL_STATE = { list: [], score: null, completion: 0, officeData: [], idSelected: undefined }

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'DESKS_FETCHED':
            return { ...state, list: action.payload.data }
        case 'OFFICE_DATA_FETCHED':
            return { ...state, officeData: action.payload.data }  
        case 'ID_SELECTED':
            return { ...state, idSelected: action.payload }          
        default:
            return state
    }
}