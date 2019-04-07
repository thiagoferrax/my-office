import React, { Component } from 'react'
import { Field, FieldArray } from 'redux-form'
import Grid from '../common/layout/grid'
import Input from '../common/form/input'
import Date from '../common/form/date'
import If from '../common/operator/if'
import Row from '../common/layout/row'
import Select from '../common/form/select'
import './itemList.css'

const getPossibleEquipments = () => {
    const equipments = []
    equipments.push({ id: 'Computer', type: 'Computer' })
    equipments.push({ id: 'Monitor', type: 'Monitor' })
    equipments.push({ id: 'Phone', type: 'Phone' })
    equipments.push({ id: 'Drawer', type: 'Drawer' })
    equipments.push({ id: 'Chair', type: 'Chair' })
    return equipments
}

export default class ItemList extends Component {

    renderRows = ({ fields, meta: { touched, error, submitFailed } }) => {

        return fields.map((member, index) => {
            return (
                <Row key={index}>

                    <Field cols='12 2'
                        name={`${member}.patrimony`}
                        type="text"
                        component={Input}
                        label="Patrimony"
                        placeholder="Patrimony"
                        readOnly={this.props.readOnly}
                    />

                    <Field name={`${member}.type`} cols='12 2'
                        component={Select}
                        options={getPossibleEquipments()}
                        optionValue='id' optionLabel='type'
                        placeholder="Type" readOnly={this.props.readOnly} />

                    <Field cols='12 5'
                        name={`${member}.specification`}
                        type="text"
                        component={Input}
                        label="Specification"
                        placeholder="Specification"
                        readOnly={this.props.readOnly}
                    />


                    <Field cols='12 2'
                        name={`${member}.expirationDate`}
                        component={Date}
                        placeholder="Expiration date"
                        readOnly={this.props.readOnly}
                    />


                    <Grid cols='12 1'>
                        <If test={!index}>
                            <button type='button' className='btn btn-default marginBottom' onClick={() => fields.unshift({})}>
                                <i className="fa fa-plus"></i>
                            </button>
                            {(touched || submitFailed) && error && <span>{error}</span>}
                        </If>
                        <If test={index}>
                            <button type='button' className='btn btn-danger' cols='12 1'
                                onClick={() => fields.remove(index)}>
                                <i className="icon ion-md-trash"></i>
                            </button>
                        </If>
                    </Grid>
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
