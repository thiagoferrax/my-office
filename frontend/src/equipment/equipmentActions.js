import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import { initialize } from 'redux-form'
import { showTabs, selectTab } from '../common/tab/tabActions'
import consts from '../consts'

const INITIAL_VALUES = {}

export function getList() {
    const request = axios.get(`${consts.API_URL}/equipments`)
    return {
        type: 'EQUIPMENTS_FETCHED',
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
        axios[method](`${consts.API_URL}/equipments/${id}`, values)
            .then(resp => {
                toastr.success('Sucess', 'Successful operation.')
                dispatch(init())
            })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function prepareToShow(equipmentId, callback) {
    return dispatch => {
        axios['get'](`${consts.API_URL}/equipments/${equipmentId}`)
            .then(equipment => { dispatch(callback(equipment.data)) })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function showUpdate(equipment) {
    return [
        showTabs('tabUpdate'),
        selectTab('tabUpdate'),
        initialize('equipmentForm', equipment)
    ]
}

export function showDelete(equipment) {
    return [
        showTabs('tabDelete'),
        selectTab('tabDelete'),
        initialize('equipmentForm', equipment)
    ]
}

export function init() {
    return [
        showTabs('tabList', 'tabCreate'),
        selectTab('tabList'),
        getList(),
        initialize('equipmentForm', INITIAL_VALUES)
    ]
}