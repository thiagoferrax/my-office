import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field } from 'redux-form'
import LabelAndInput from '../common/form/labelAndInput'
import { init } from './equipmentActions'
import Date from '../common/form/date'
import Select from '../common/form/select'
import Input from '../common/form/input'

import { getList as getUserList } from '../user/userActions'


const getPossibleEquipments = () => {
    const equipments = []
    equipments.push({ id: 'Computer', type: 'Computer' })
    equipments.push({ id: 'Monitor', type: 'Monitor' })
    equipments.push({ id: 'Phone', type: 'Phone' })
    equipments.push({ id: 'Drawer', type: 'Drawer' })
    equipments.push({ id: 'Chair', type: 'Chair' })
    return equipments
}

class EquipmentForm extends Component {
    componentWillMount() {
        this.props.getUserList()
    }

    render() {
        const { handleSubmit, readOnly, userList } = this.props
        return (
            <form role='form' onSubmit={handleSubmit}>
                <div className='box-body'>

                    <Field cols='12 2'
                        name="patrimony"
                        type="text"
                        component={LabelAndInput}
                        label="Patrimony"
                        placeholder="Enter the patrimony"
                        readOnly={readOnly}
                    />

                    <Field name="type" cols='12 2'
                        component={Select}
                        label="Type"
                        options={getPossibleEquipments()}
                        optionValue='id' optionLabel='type'
                        placeholder="Enter the type" readOnly={readOnly} />

                    <Field cols='12 6'
                        name="specification"
                        type="text"
                        component={LabelAndInput}
                        label="Specification"
                        placeholder="Enter the specification"
                        readOnly={readOnly}
                    />


                    <Field cols='12 2'
                        id="expirationDate"
                        name="expirationDate"
                        label="Expiration date"
                        component={Date}
                        placeholder="Enter the expiration date"
                        readOnly={readOnly}
                    />

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

EquipmentForm = reduxForm({ form: 'equipmentForm', destroyOnUnmount: false })(EquipmentForm)

const mapStateToProps = state => ({ userList: state.user.list })
const mapDispatchToProps = dispatch => bindActionCreators({ init, getUserList }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EquipmentForm)