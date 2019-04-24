import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field, formValueSelector } from 'redux-form'

import { init, getOfficeData, prepareToShow, showUpdate, showCreate, update } from './deskActions'
import { getList as getRooms } from '../room/roomActions'
import { getList as getEmployees } from '../employee/employeeActions'
import If from '../common/operator/if'
import Grid from '../common/layout/grid'
import OfficeMap from 'office-map'

import Select from '../common/form/select'
import ItemList from './itemList'
import EmployeeList from './employeeList'
import SelectWithIcon from '../common/form/selectWithIcon'

import './desk.css'

class DeskForm extends Component {

    componentWillMount() {
        this.props.getRooms()
        this.props.getEmployees()
    }

    getPossibleDirections() {
        const directions = []
        directions.push({ id: 'north', name: 'North' })
        directions.push({ id: 'south', name: 'South' })
        directions.push({ id: 'east', name: 'East' })
        directions.push({ id: 'west', name: 'West' })
        directions.push({ id: 'north-east', name: 'North-east' })
        directions.push({ id: 'north-west', name: 'North-west' })
        directions.push({ id: 'south-east', name: 'South-east' })
        directions.push({ id: 'south-west', name: 'South-west' })

        return directions
    }

    getPossiblePositions() {
        const positions = []

        for (let i = 0; i < 26; i++) {
            positions.push({ id: i, name: i })
        }

        return positions
    }

    render() {

        const { rooms, handleSubmit, submitLabel, readOnly, getOfficeData, officeData, showCreate, showUpdate, equipments, employees } = this.props


        const functionShow = submitLabel === 'Create' ? showCreate : showUpdate

        return (
            <form role='form' onSubmit={handleSubmit}>
                <div className='box-body'>
                    <Field name='roomId' label='Room' cols='12 6'
                        component={Select} readOnly={readOnly}
                        options={rooms} optionValue='id' optionLabel='name' autoFocus={true}
                        inputOnChange={getOfficeData} />
                    <Field name='chairDirection' label='Chair direction' cols='12 2'
                        component={SelectWithIcon} icon="compass" readOnly={readOnly}
                        options={this.getPossibleDirections()} optionValue='id' optionLabel='name' />
                    <Field name='x' label='X position' cols='12 2'
                        component={SelectWithIcon} icon="map-marker" readOnly={readOnly}
                        options={this.getPossiblePositions()} optionValue='id' optionLabel='name' />
                    <Field name='y' label='Y position' cols='12 2'
                        component={SelectWithIcon} icon="map-marker" readOnly={readOnly}
                        options={this.getPossiblePositions()} optionValue='id' optionLabel='name' />

                    <EmployeeList cols='12 6' list={employees} readOnly={readOnly}
                        field='employees' legend='Employee' icon='user-plus' />

                    <ItemList cols='12 6' list={equipments} readOnly={readOnly}
                        field='equipments' legend='Equipments' icon='laptop' />

                </div>
                <div className='box-footer text-right'>
                    <button type='submit' className={`btn btn-${this.props.submitClass}`}>
                        {this.props.submitLabel}
                    </button>
                    <button type='button' className='btn btn-default'
                        onClick={this.props.init}>{this.props.cancelLabel}</button>
                </div>
                <If test={officeData && officeData.length > 0}>
                    <div className='box-footer'>
                        <Grid key="key_office_data" cols='12'>
                            <div className="box_ box-default">
                                <div className="box-header with-border">
                                    <i className="fa fa-building-o"></i>
                                    <h3 className="box-title">MY OFFICE - {officeData[0] && officeData[0].room}</h3>
                                </div>
                                <div className="box-body">
                                    <OfficeMap
                                        data={officeData}
                                        horizontalSize={6}
                                        verticalSize={6}
                                        onSelect={desk => this.props.prepareToShow(desk, functionShow)}
                                        onMove={desk => this.props.update(desk, functionShow)}
                                        editMode={true} 
                                        showNavigator={true}
                                        fields={['type', 'patrimony', 'specification']} />
                                </div>
                            </div>
                        </Grid >
                    </div>
                </If>
            </form>
        )
    }
}

DeskForm = reduxForm({ form: 'deskForm', destroyOnUnmount: false })(DeskForm)
const selector = formValueSelector('deskForm')

const mapStateToProps = state => ({
    rooms: state.room.list,
    officeData: state.desk.officeData,
    equipments: state.desk.equipments,
    employees: state.employee.list
})
const mapDispatchToProps = dispatch => bindActionCreators({ init, getRooms, getEmployees, getOfficeData, prepareToShow, showCreate, showUpdate, update }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(DeskForm)