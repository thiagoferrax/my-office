import React, { Component } from 'react'
import { Field, FieldArray } from 'redux-form'
import Grid from '../common/layout/grid'
import Input from '../common/form/input'
import Date from '../common/form/date'
import If from '../common/operator/if'
import Row from '../common/layout/row'
import Select from '../common/form/select'
import EquipmentSuggestion from './suggestion'
import './equipmentList.css'

const getPossibleEquipments = () => {
    const equipments = []
    equipments.push({ id: 'Chair', type: 'Chair' })
    equipments.push({ id: 'Desk', type: 'Desk' })
    equipments.push({ id: 'Desktop', type: 'Desktop' })
    equipments.push({ id: 'Drawer', type: 'Drawer' })
    equipments.push({ id: 'Laptop', type: 'Laptop' })
    equipments.push({ id: 'Monitor', type: 'Monitor' })
    equipments.push({ id: 'Phone', type: 'Phone' })
    return equipments
}

export default class ItemList extends Component {
    onSelected = (equipment, member, index) => {
        if(this.props.onSelected) {
            this.props.onSelected(equipment, member, index)
        }
    }

    renderRows = ({ fields, meta: { touched, error, submitFailed } }) => {

        return fields.map((member, index) => {
            return (
                <Row key={index}>

                    <Field cols='12 4'
                        name={`${member}.patrimony`}
                        type="text"
                        component={Input}
                        placeholder="Patrimony"
                        component={EquipmentSuggestion} 
                        list={this.props.list}
                        icon="fa fa-tag"                        
                        field="patrimony"
                        onSelected={equipment => this.onSelected(equipment, member, index)}
                        readOnly={this.props.readOnly}
                    />

                    <Field name={`${member}.type`} cols='12 6'
                        component={Select}
                        options={getPossibleEquipments()}
                        optionValue='id' optionLabel='type'
                        placeholder="Type" readOnly={this.props.readOnly} />

                    <Grid cols='12 2'>
                        <If test={!index}>
                            <button type='button' className='btn btn-default marginBottom' onClick={() => fields.unshift({})} cols='12 1'>
                                <i className="fa fa-plus"></i>
                            </button>
                            {(touched || submitFailed) && error && <span>{error}</span>}
                        </If>
                        <If test={index}>
                            <button type='button' className='btn btn-danger marginBottom' cols='12 1'
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
