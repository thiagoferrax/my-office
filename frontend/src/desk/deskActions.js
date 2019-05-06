import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import { initialize } from 'redux-form'
import { showTabs, selectTab } from '../common/tab/tabActions'
import { getList as getEmployees } from '../employee/employeeActions'
import { getList as getEquipments } from '../equipment/equipmentActions'
import consts from '../consts'

const INITIAL_VALUES = { rooms: [], officeData: [], equipments: [{}], employees: [{}] }

export function getList() {
    const request = axios.get(`${consts.API_URL}/desks`)
    return {
        type: 'DESKS_FETCHED',
        payload: request
    }
}

export function getOfficeData(roomId) {
    let request = {data: []}
    if(roomId) {
        request = axios.get(`${consts.API_URL}/rooms/${roomId}/officeData`)
    }    
    return {
        type: 'OFFICE_DATA_FETCHED',
        payload: request
    }
}

export function create(values) {
    return submit(values, 'post')
}

export function update(values) {
    return submit(values, 'put')
}

export function remove(values) {
    return submit(values, 'delete')
}

export function selectId(id) {
    return {
        type: 'ID_SELECTED',
        payload: id
    }
}

function submit(values, method) {
    return dispatch => {
        const id = values.id ? values.id : ''
        const roomId = values.roomId
        const isUpdate = method === 'put' && id 

        axios[method](`${consts.API_URL}/desks/${id}`, values)
            .then(resp => {
                toastr.success('Success', 'Successful operation.')
                dispatch([getOfficeData(roomId), isUpdate ? initUpdate(values) : init()])
            })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}
export function initializeEmployee() {
    return {
        type: 'EMPLOYEE_INITIALIZED'
    }
}

export function prepareToShow(desk, callback) {
    return dispatch => {
        axios['get'](`${consts.API_URL}/desks/${desk.id}`)
            .then(d => {
                const deskToUpdate = d.data
                if (desk.x >= 0 && desk.y >= 0) {
                    deskToUpdate.x = desk.x
                    deskToUpdate.y = desk.y
                }
                dispatch(callback(deskToUpdate))
            })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function showUpdate(desk) {
    return [
        selectId(desk.id),
        showTabs('tabUpdate'),
        selectTab('tabUpdate'),
        initialize('deskForm', desk),
        getOfficeData(desk.roomId)
    ]
}


export function showCreate(desk) {
    delete desk.id
    return [
        showTabs('tabCreate', 'tabList'),
        selectTab('tabCreate'),
        initialize('deskForm', desk),
        //getOfficeData(desk.roomId)
    ]
}

export function showDelete(desk) {
    return [
        selectId(desk.id),
        showTabs('tabDelete'),
        selectTab('tabDelete'),
        initialize('deskForm', desk)
    ]
}

export function initUpdate(desk) {
    return [
        selectId(desk.id),
        initialize('deskForm', desk),
        getOfficeData(desk.roomId)
    ]
}

export function init() {
    return [
        selectId(undefined),
        showTabs('tabCreate', 'tabList'),
        selectTab('tabCreate'),
        getList(),
        getEmployees(),
        getEquipments(),
        initialize('deskForm', INITIAL_VALUES),
        getOfficeData(null)
    ]
}