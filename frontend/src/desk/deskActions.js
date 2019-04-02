import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import { initialize } from 'redux-form'
import { showTabs, selectTab } from '../common/tab/tabActions'
import consts from '../consts'

const INITIAL_VALUES = { rooms: [], officeData:  [], equipments: [{}]}

export function getList() {
    const request = axios.get(`${consts.API_URL}/desks`)
    return {
        type: 'DESKS_FETCHED',
        payload: request
    }
}

export function getOfficeData(roomId) {
    const request = axios.get(`${consts.API_URL}/rooms/${roomId}/officeData`)
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

function submit(values, method) {
    return dispatch => {
        const id = values.id ? values.id : ''
        const roomId = values.roomId
        axios[method](`${consts.API_URL}/desks/${id}`, values)
            .then(resp => {
                toastr.success('Sucess', 'Successful operation.')
                dispatch([getOfficeData(roomId), init()])
            })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function getEquipments(desk) {
    const request = axios.get(`${consts.API_URL}/desks/${desk.id}/equipments`)
    return {
        type: 'EQUIPMENTS_FETCHED',
        payload: request
    }
}

export function initializeChecklist() {
    return {
        type: 'CHECKLIST_INITIALIZED'
    }
}

export function prepareToShow(desk, callback) {
    return dispatch => {
        axios['get'](`${consts.API_URL}/desks/${desk.id}`)
            .then(d => { 
                const deskToUpdate = d.data
                if(desk.x >= 0 && desk.y >= 0) {
                    deskToUpdate.x = desk.x
                    deskToUpdate.y = desk.y
                }
                dispatch(callback(deskToUpdate)) })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function showUpdate(desk) {
    return [ 
        showTabs('tabUpdate'),
        selectTab('tabUpdate'),        
        initialize('deskForm', desk),
        getOfficeData(desk.roomId)
    ]
}

export function showDelete(desk) {
    return [ 
        showTabs('tabDelete'),
        selectTab('tabDelete'),
        initialize('deskForm', desk)
    ]
}

export function init() {
    return [
        showTabs('tabCreate', 'tabList'),
        selectTab('tabCreate'),
        getList(),
        initialize('deskForm', INITIAL_VALUES),
    ]
}