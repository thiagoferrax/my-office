import '../common/template/dependencies'
import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Auth from '../auth/auth'
import { validateToken } from '../auth/authActions'
import Dashboard from '../dashboard/dashboard'
import Room from '../room/room'
import Employee from '../employee/employee'
import Desk from '../desk/desk'
import Timeline from '../timeline/timeline'
import Equipment from '../equipment/equipment'

import { Route } from 'react-router-dom'

class AuthOrApp extends Component {
    componentWillMount() {
        if (this.props.auth.user) {
            this.props.validateToken(this.props.auth.user.token)
        }
    }

    render() {
        const { user, validToken } = this.props.auth
        if (user && validToken) {
            axios.defaults.headers.common['authorization'] = user.token
            return [<Route exact key='route_dashboard' path='/' component={Dashboard}/>,
            <Route key='route_rooms' path='/rooms' component={Room} />,
            <Route key='route_employees' path='/employees' component={Employee} />,
            <Route key='route_equipments' path='/equipments' component={Equipment} />,
            <Route key='route_desks' path='/desks' component={Desk} />,
            <Route key='route_timeline' path='/timeline' component={Timeline} />]
        } else if (!user && !validToken) {
            return <Route key='route_auth' path='/' component={Auth}/>
        } else {
            return false
        }
    }
}

const mapStateToProps = state => ({ auth: state.auth })
const mapDispatchToProps = dispatch => bindActionCreators({ validateToken }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(AuthOrApp)