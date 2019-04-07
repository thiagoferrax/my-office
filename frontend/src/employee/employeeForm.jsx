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

        if (!parentId) {
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
                                shrink={true} />
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

                    <Field name='identifier' component={LabelAndInput} readOnly={readOnly}
                        label='Identifier' cols='12 4' placeholder='Enter the identifier' autoFocus={true} />

                    <Field name='email' component={LabelAndInput} readOnly={readOnly}
                        label='Email' cols='12 4' placeholder='Enter the email' autoFocus={true} />

                    <Field name='phone' component={LabelAndInput} readOnly={readOnly}
                        label='Phone' cols='12 4' placeholder='Enter the phone' autoFocus={true} />

                    <Field name='role' component={LabelAndInput} readOnly={readOnly}
                        label='Role' cols='12 4' placeholder='Enter the role' autoFocus={true} />

                    <Field name='department' component={LabelAndInput} readOnly={readOnly}
                        label='Department' cols='12 4' placeholder='Enter the department' autoFocus={true} />
                </div>
                <div className='box-footer text-right'>
                    <button type='submit' className={`btn btn-${this.props.submitClass}`}>
                        {this.props.submitLabel}
                    </button>
                    <button type='button' className='btn btn-default'
                        onClick={this.props.init}>Cancel</button>
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