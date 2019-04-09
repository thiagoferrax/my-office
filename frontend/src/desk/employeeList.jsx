import React, { Component } from 'react'
import { Field, FieldArray } from 'redux-form'
import Grid from '../common/layout/grid'
import Input from '../common/form/input'
import Date from '../common/form/date'
import If from '../common/operator/if'
import Row from '../common/layout/row'
import Phone from '../common/form/phone'
import Email from '../common/form/email'
import Identifier from '../common/form/identifier'

import EmployeeNameSuggestion from './employeeNameSuggestion'

const getPossibleEquipments = () => {
    const equipments = []
    equipments.push({ id: 'Computer', name: 'Computer' })
    equipments.push({ id: 'Monitor', name: 'Monitor' })
    equipments.push({ id: 'Keyboard', name: 'Keyboard' })
    equipments.push({ id: 'Mouse', name: 'Mouse' })
    equipments.push({ id: 'Phone', name: 'Phone' })
    equipments.push({ id: 'Drawer', name: 'Drawer' })
    equipments.push({ id: 'Chair', name: 'Chair' })
    return equipments
}

export default class EmployeeList extends Component {

    renderRows = ({ fields, meta: { touched, error, submitFailed } }) => {

        return fields.map((member, index) => {
            return (
                <Row key={index}>

                    <Field cols='12 8'
                        name={`${member}.name`}
                        type="text"
                        field="name"
                        list={this.props.list}
                        placeholder="Name"
                        readOnly={this.props.readOnly}
                        component={EmployeeNameSuggestion} />


                    <Field cols='12 4'
                        name={`${member}.identifier`}
                        type="text"
                        component={Identifier}
                        placeholder="Identifier"
                        readOnly={this.props.readOnly}
                    />


                    <If test={index}>
                        <button type='button' className='btn btn-danger' cols='12 1'
                            onClick={() => fields.remove(index)}>
                            <i className="icon ion-md-trash"></i>
                        </button>
                    </If>
                </Row>)
        })
    }

    render() {
        return (<Grid cols={this.props.cols}>
            <div className="box_ box-default">
                <div className="box-header with-border">
                    <i className={`fa fa-${this.props.icon}`}></i>
                    <h3 className="box-title"><label>{this.props.legend}</label></h3>
                </div>
                <div className="box-body box-body_desks">
                    <FieldArray name={this.props.field} component={this.renderRows} />
                </div>
            </div>
        </Grid >)
    }
}
