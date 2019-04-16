import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import { initialize } from 'redux-form'
import { showTabs, selectTab } from '../common/tab/tabActions'
import consts from '../consts'

const INITIAL_VALUES = {name: '', parentId: undefined, list: [], employees: [{}]}

export function getList() {
    const request = axios.get(`${consts.API_URL}/employees`)
    return {
        type: 'EMPLOYEES_FETCHED',
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
        axios[method](`${consts.API_URL}/employees/${id}`, values)
            .then(resp => {
                toastr.success('Success', 'Successful operation.')
                dispatch(init())
            })
            .catch(e => {
                e.response.data.errors.forEach(error => toastr.error('Error', error))
            })
    }
}

export function showUpdate(employee) {
    return [ 
        showTabs('tabUpdate'),
        selectTab('tabUpdate'),        
        initialize('employeeForm', employee),
    ]
}

export function showDelete(employee) {
    return [ 
        showTabs('tabDelete'),
        selectTab('tabDelete'),
        initialize('employeeForm', employee)
    ]
}

export function init() {
    return [
        showTabs('tabList', 'tabCreate'),
        selectTab('tabList'),
        getList(),
        initialize('employeeForm', INITIAL_VALUES)
    ]
}