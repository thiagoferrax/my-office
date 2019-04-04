import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field } from 'redux-form'
import Tree from 'tree-slide-bar'
import If from '../common/operator/if'
import PropTypes from 'prop-types'

import { init, getTree, showDelete, clone, showUpdate, selectParent } from './employeeActions'
import LabelAndInput from '../common/form/labelAndInput'
import Select from '../common/form/select'
import Grid from '../common/layout/grid'

class EmployeeForm extends Component {
    constructor(props) {
        super(props)
        this.cloneEmployee = this.cloneEmployee.bind(this)
    }

    static contextTypes = {
        store: PropTypes.object
    }

    componentWillMount() {
        this.props.getTree()
    }

    getEmployeeById(tree, employeeId, found = undefined) {
        return tree.reduce((found, employee) => {
            if (employee.id === employeeId) {
                found = employee
            } else if (employee.children) {
                const foundInChildren = this.getEmployeeById(employee.children, employeeId)
                if (foundInChildren) {
                    found = foundInChildren
                }
            }
            return found
        }, found)
    }

    cloneEmployee() {
        let { tree, parentId } = this.props

        if(!parentId) {
            parentId = undefined
        }

        const employee = this.getEmployeeById(tree || [], parentId)
            this.props.clone(employee)
    }

    getEmployees(tree) {
        const { showDelete, showUpdate } = this.props
        return tree && tree.map(employee => {
            return (
                <Grid key={`employee_${employee.id}`} cols='12'>
                    <div className="box_ box-default">
                        <div className="box-header with-border">
                            <i className="fa fa-check"></i>
                            <h3 className="box-title">&nbsp;&nbsp;MY OFFICE - {employee.description}</h3>
                        </div>
                        <div className="box-body">
                            <Field
                                name={`employee_${employee.id}`}
                                component={Tree}
                                tree={[employee]}
                                hideSlideBar={true}
                                onEdit={showUpdate}
                                onDelete={showDelete} 
                                shrink={true}/>
                        </div>
                    </div>
                </Grid >
            )
        })
    }

    render() {
        const { handleSubmit, readOnly, list, description, parentId, tree, init } = this.props
        return (
            <form role='form' onSubmit={handleSubmit}>
                <div className='box-body'>
                    <Field name='description' value={description} component={LabelAndInput} readOnly={readOnly}
                        label='Name' cols='12 4' placeholder='Enter the item description' autoFocus={true} />

                    <Field name='parentId' value={parentId} component={Select} readOnly={readOnly}
                        label='Parent path' cols='12 6' options={list}
                        optionValue='id' optionLabel='path' inputOnChange={this.props.selectParent} />

                    <Grid cols='12 2'>
                        <If test={readOnly}>
                            <div className='buttons_employee_form'>
                                <button type='submit' className='btn btn-danger'>
                                    <i className="icon ion-md-trash"></i>
                                </button>
                                <button type='button' className='btn btn-default'
                                    onClick={init}>
                                    <i className="icon ion-md-close"></i>
                                </button>
                            </div>
                        </If>
                        <If test={!readOnly}>
                            <div className='buttons_employee_form'>
                                <button type='submit' className='btn btn-primary' title="Save">
                                    <i className="fa fa-check"></i>
                                </button>
                                <button type='button' className='btn btn-warning' onClick={this.cloneEmployee} title="Clone Parent path">
                                    <i className="fa fa-copy"></i>
                                </button>
                                <button type='button' className='btn btn-default'
                                    onClick={init} title="Clear">
                                    <i className="icon ion-md-close"></i>
                                </button>
                            </div>
                        </If>
                    </Grid>
                </div>
                <div className='box-footer'>
                    <If test={!readOnly}>
                        {this.getEmployees(tree)}
                    </If>
                </div>
            </form>
        )
    }
}

EmployeeForm = reduxForm({ form: 'employeeForm', destroyOnUnmount: false })(EmployeeForm)

const mapStateToProps = state => ({
    description: state.employee.description,
    parentId: state.employee.parentId,
    list: state.employee.list,
    tree: state.employee.tree
})

const mapDispatchToProps = dispatch => bindActionCreators({ init, getTree, showDelete, showUpdate, clone, selectParent }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EmployeeForm)