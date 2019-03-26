import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getSummary } from './dashboardActions'
import ContentHeader from '../common/template/contentHeader'
import Content from '../common/template/content'
import InfoBox from '../common/widget/infoBox'
import EvaluationBarChart from '../common/chart/evaluationBarChart'
import SprintRadarChart from '../common/chart/sprintRadarChart'
import ComparativeLineChart from '../common/chart/comparativeLineChart'
import FishboneChart from '../common/chart/fishboneChart'
import ParetoChart from '../common/chart/paretoChart'


import Row from '../common/layout/row'

class Dashboard extends Component {
    componentWillMount() {
        this.props.getSummary()
    }

    componentDidMount() {
        this.interval = setInterval(() => this.props.getSummary(), 5000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    render() {
        const { projects, number_evaluations, members } = this.props.summary
        return (
            <div>
                <ContentHeader title='Dashboard' small='Control Panel' />
                <Content>
                    <Row>
                        <InfoBox cols='12 6 4' color='aqua' icon='cube'
                            value={projects.length} text='Rooms' />
                        <InfoBox cols='12 6 4' color='red' icon='people '
                            value={members.length} text='Managers' />
                        <InfoBox cols='12 6 4' color='green' icon='options'
                            value={number_evaluations} text='Desks' />
                    </Row>
                   
                </Content>
                <br />
                <br />
            </div>
        )
    }
}

const mapStateToProps = state => ({ summary: state.dashboard.summary })
const mapDispatchToProps = dispatch => bindActionCreators({ getSummary }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)