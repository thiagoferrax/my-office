import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field } from 'redux-form'
import PropTypes from 'prop-types'

import { init, showDelete, showUpdate } from './employeeActions'
import LabelAndInput from '../common/form/labelAndInput'

import Date from '../common/form/date'
import If from '../common/operator/if'
import Row from '../common/layout/row'
import Phone from '../common/form/phone'
import Email from '../common/form/email'
import Identifier from '../common/form/identifier'

class EmployeeForm extends Component {

    render() {
        const { handleSubmit, readOnly, name } = this.props
        return (
            <form role='form' onSubmit={handleSubmit}>
                <div className='box-body'>
                    <Field name='name' value={name} component={LabelAndInput} readOnly={readOnly}
                        label='Name' cols='12 3' autoFocus={true} />

                    <Field name='identifier' component={Identifier} readOnly={readOnly}
                        label='Identifier' cols='12 3' autoFocus={true} />

                    <Field name='email' component={Email} readOnly={readOnly}
                        label='Email' cols='12 3' autoFocus={true} />

                    <Field name='phone' component={Phone} readOnly={readOnly}
                        label='Phone' cols='12 3' autoFocus={true} />

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
    name: state.employee.name,
    list: state.employee.list,
})

const mapDispatchToProps = dispatch => bindActionCreators({ init, showDelete, showUpdate }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EmployeeForm)