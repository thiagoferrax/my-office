import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getSummary } from './dashboardActions'
import ContentHeader from '../common/template/contentHeader'
import Content from '../common/template/content'
import InfoBox from '../common/widget/infoBox'
import OfficeMap from 'office-map'
import Grid from '../common/layout/grid'
import Row from '../common/layout/row'
import {getList as getEmployees} from '../employee/employeeActions'

class Dashboard extends Component {
    componentWillMount() {
        this.props.getSummary()
        this.props.getEmployees()
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.props.getSummary()
            this.props.getEmployees()
        }, 5000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    render() {
        // Number of types of equipment per room
        // Number of employees per room
        // Number of tables occupied and unoccupied per room
        // Number of equipment types expiring per month

        const { rooms, number_desks, members, officeData } = this.props.summary
        const employees = this.props.employees
        return (
            <div>
                <ContentHeader title='Dashboard' small='Control Panel' />
                <Content>
                    <Row>
                        <InfoBox cols='12 6 3' color='aqua' icon='cube'
                            value={rooms.length} text='Rooms' />
                        <InfoBox cols='12 6 3' color='red' icon='person'
                            value={members.length} text='Managers' />
                        <InfoBox cols='12 6 3' color='yellow' icon='people'
                            value={(employees && employees.length) || 0} text='Employees' />
                        <InfoBox cols='12 6 3' color='green' icon='desktop'
                            value={number_desks} text='Workstations' />
                    </Row>
                    <Row>
                        {
                            officeData && Object.keys(officeData).map((room => {
                                return (<Grid key={`room_${room}`} cols='12'>
                                    <div className="box_ box-default">
                                        <div className="box-header with-border">
                                            <i className="fa fa-building-o"></i>
                                            <h3 className="box-title">MY OFFICE - {officeData[room][0] && officeData[room][0].room}</h3>
                                        </div>
                                        <div className="box-body">
                                            <OfficeMap
                                                id={`id_${room}`}
                                                data={officeData[room]}
                                                fields={['type', 'patrimony', 'specification']}
                                                horizontalSize={6}
                                                verticalSize={4}
                                                showNavigator={true}
                                            />
                                        </div>
                                    </div>
                                </Grid >)
                            }))
                        }

                    </Row>
                </Content>
                <br />
                <br />
            </div>
        )
    }
}

const mapStateToProps = state => ({ summary: state.dashboard.summary,
                                    employees: state.employee.list })
const mapDispatchToProps = dispatch => bindActionCreators({ getSummary, getEmployees }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)