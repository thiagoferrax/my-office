const INITIAL_STATE = {summary: {rooms: [], desks: [], number_checklists: 0, number_desks: 0, members: []}}

export default function(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'DASHBOARD_SUMMARY_FETCHED':
            if(!action.payload.data) {
                return { ...state, summary: INITIAL_STATE.summary }    
            }
            
            return { ...state, summary: action.payload.data }
        default:
            return state
    }
}