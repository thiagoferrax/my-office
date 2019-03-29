import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import { initialize } from 'redux-form'
import { showTabs, selectTab } from '../common/tab/tabActions'
import consts from '../consts'

const INITIAL_VALUES = { rooms: [], officeData:  [], equipments: [{}]}

export function getList() {
    const request = axios.get(`${consts.API_URL}/desks`)
    return {
        type: 'EVALUATIONS_FETCHED',
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

export function selectChecklist(checklistId) {
    return {
        type: 'CHECKLIST_SELECTED',
        payload: checklistId
    }
}

export function updateScore(score) {
    return {
        type: 'SCORE_UPDATED',
        payload: score
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

export function getAnswers(desk) {
    const request = axios.get(`${consts.API_URL}/desks/${desk.id}/answers`)
    return {
        type: 'ANSWERS_FETCHED',
        payload: request
    }
}

export function initializeChecklist() {
    return {
        type: 'CHECKLIST_INITIALIZED'
    }
}

export function prepareToShow(deskId, callback) {
    return dispatch => {
        axios['get'](`${consts.API_URL}/desks/${deskId}`)
            .then(desk => { dispatch(callback(desk.data)) })
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
        selectTab('tabList'),
        getList(),
        initialize('deskForm', INITIAL_VALUES),
    ]
}