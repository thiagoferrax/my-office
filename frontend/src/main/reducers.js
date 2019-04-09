import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'

import DashboardReducer from '../dashboard/dashboardReducer'
import TabReducer from '../common/tab/tabReducer'
import RoomReducer from '../room/roomReducer'
import EmployeeReducer from '../employee/employeeReducer'
import DeskReducer from '../desk/deskReducer'
import AuthReducer from '../auth/authReducer'
import UserReducer from '../user/userReducer'
import TimelineReducer from '../timeline/timelineReducer'
import EquipmentReducer from '../equipment/equipmentReducer'

const rootReducer = combineReducers({
    dashboard: DashboardReducer,
    tab: TabReducer,
    room: RoomReducer,
    employee: EmployeeReducer,
    desk: DeskReducer,
    form: formReducer,    
    toastr: toastrReducer,
    auth: AuthReducer,
    user: UserReducer,
    timeline: TimelineReducer,
    equipment: EquipmentReducer,
})

export default rootReducer