import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import { initialize } from 'redux-form'
import { showTabs, selectTab } from '../common/tab/tabActions'
import consts from '../consts'

const INITIAL_VALUES = {}

export function getList() {
    const request = axios.get(`${consts.API_URL}/rooms`)
    return {
        type: 'PROJECTS_FETCHED',
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
        axios[method](`${consts.API_URL}/rooms/${id}`, values)
            .then(resp => {
                toastr.success('Success', 'Successful operation.')
                dispatch(init())
            })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function prepareToShow(roomId, callback) {
    return dispatch => {
        axios['get'](`${consts.API_URL}/rooms/${roomId}`)
            .then(room => { dispatch(callback(room.data)) })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function showUpdate(room) {
    return [
        showTabs('tabUpdate'),
        selectTab('tabUpdate'),
        initialize('roomForm', room)
    ]
}

export function showDelete(room) {
    return [
        showTabs('tabDelete'),
        selectTab('tabDelete'),
        initialize('roomForm', room)
    ]
}

export function init() {
    return [
        showTabs('tabList', 'tabCreate'),
        selectTab('tabList'),
        getList(),
        initialize('roomForm', INITIAL_VALUES)
    ]
}