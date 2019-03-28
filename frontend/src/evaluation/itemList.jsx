import React, { Component } from 'react'
import { Field, FieldArray } from 'redux-form'
import Grid from '../common/layout/grid'
import Input from '../common/form/input'
import If from '../common/operator/if'
import Row from '../common/layout/row'

export default props => {
    const renderRows = ({ fields, meta: { touched, error, submitFailed } }) => {
        return fields.map((member, index) => (
            <Row key={index}>
                <Field autoFocus={true} cols='12 3'
                    name={`${member}.name`}
                    type="text"
                    component={Input}
                    label="Name"
                    placeholder="Equipment name"
                    readOnly={props.readOnly}
                />
                <Field cols='12 8'
                    name={`${member}.specification`}
                    type="text"
                    component={Input}
                    label="Specification"
                    placeholder="Equipment specification"
                    readOnly={props.readOnly}
                />
                <If test={!index}>
                    <button type='button' className='btn btn-info' cols='12 1'
                        onClick={() => { fields.unshift({}) }}>
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
            </Row>
        ))
    }


    return (
        <Grid cols={props.cols}>
            <div className="box_ box-default">
                <div className="box-header with-border">
                    <i className="fa fa-laptop"></i>
                    <h3 className="box-title"><label>{props.legend}</label></h3>
                </div>
                <div className="box-body box-body_desks">
                    <FieldArray name={props.field} component={renderRows} />
                </div>
            </div>
        </Grid >
    )
}
