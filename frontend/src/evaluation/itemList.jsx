import React, { Component } from 'react'
import { Field, FieldArray } from 'redux-form'
import Grid from '../common/layout/grid'
import Input from '../common/form/input'
import If from '../common/operator/if'
import Row from '../common/layout/row'
import Select from '../common/form/select'

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

export default class ItemList extends Component {
    renderRows = ({ fields, meta: { touched, error, submitFailed } }) => {

        return fields.map((member, index) => {
            console.log('renderRows', index)

            return (
                <Row key={index}>

                    <Field name={`${member}.name`} cols='12 3'
                        component={Select}
                        options={getPossibleEquipments()} optionValue='id' optionLabel='name' placeholder="Equipment name" readOnly={this.props.readOnly} />

                    <Field cols='12 8'
                        name={`${member}.specification`}
                        type="text"
                        component={Input}
                        label="Specification"
                        placeholder="Equipment specification"
                        readOnly={this.props.readOnly}
                    />
                    <If test={!index}>
                        <button type='button' className='btn btn-info' cols='12 1'
                            onClick={() => {
                                console.log('clicked')
                                fields.unshift({})
                            }}>
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
                </Row>)
        })
    }

    render() {
        return (<Grid cols={this.props.cols}>
            <div className="box_ box-default">
                <div className="box-header with-border">
                    <i className="fa fa-laptop"></i>
                    <h3 className="box-title"><label>{this.props.legend}</label></h3>
                </div>
                <div className="box-body box-body_desks">
                    <FieldArray name={this.props.field} component={this.renderRows} />
                </div>
            </div>
        </Grid >)
    }
}
