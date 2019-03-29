import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field, formValueSelector } from 'redux-form'

import { init, selectChecklist, updateScore, getOfficeData, prepareToShow, showUpdate } from './evaluationActions'
import { getList as getChecklists, getTree } from '../checklist/checklistActions'
import { getList as getProjects } from '../project/projectActions'
import Tree from 'tree-slide-bar'
import If from '../common/operator/if'
import Grid from '../common/layout/grid'
import ProgressBar from '../common/widget/progressBar'
import OfficeMap from 'office-map'

import Select from '../common/form/select'
import ItemList from './itemList'

import './evaluation.css'

class EvaluationForm extends Component {

    componentWillMount() {
        this.props.getChecklists()
        this.props.getTree()
        this.props.getProjects()
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

        for (let i = 0; i < 100; i++) {
            positions.push({ id: i, name: i })
        }

        return positions
    }

    render() {

        const { projects, checklist, handleSubmit, readOnly, getOfficeData, officeData, showUpdate, equipments } = this.props

        return (
            <form role='form' onSubmit={handleSubmit}>
                <div className='box-body'>
                    <Field name='projectId' label='Room' cols='12 3'
                        component={Select} readOnly={readOnly}
                        options={projects} optionValue='id' optionLabel='name' autoFocus={true}
                        inputOnChange={getOfficeData} />
                    <Field name='chairDirection' label='Chair direction' cols='12 3'
                        component={Select} readOnly={readOnly}
                        options={this.getPossibleDirections()} optionValue='id' optionLabel='name' />
                    <Field name='x' label='X position' cols='12 3'
                        component={Select} readOnly={readOnly}
                        options={this.getPossiblePositions()} optionValue='id' optionLabel='name' />
                    <Field name='y' label='Y position' cols='12 3'
                        component={Select} readOnly={readOnly}
                        options={this.getPossiblePositions()} optionValue='id' optionLabel='name' />

                    <ItemList cols='12' list={equipments || [{}]} readOnly={readOnly}
                        field='equipments' legend='Equipments' />
                </div>
                <div className='box-footer text-right'>
                    <button type='submit' className={`btn btn-${this.props.submitClass}`}>
                        {this.props.submitLabel}
                    </button>
                    <button type='button' className='btn btn-default'
                        onClick={this.props.init}>Cancel</button>
                </div>
                <If test={officeData && officeData.length > 0}>
                    <div className='box-footer'>
                        <Grid key={`checklist_${checklist.id}`} cols='12'>
                            <div className="box_ box-default">
                                <div className="box-header with-border">
                                    <i className="fa fa-building-o"></i>
                                    <h3 className="box-title">MY OFFICE - {officeData[0] && officeData[0].room}</h3>
                                </div>
                                <div className="box-body">
                                    <OfficeMap data={officeData} onSelect={deskId => this.props.prepareToShow(deskId, showUpdate)} minHorizontalSize={6} />
                                </div>
                            </div>
                        </Grid >
                    </div>
                </If>
            </form>
        )
    }
}

EvaluationForm = reduxForm({ form: 'evaluationForm', destroyOnUnmount: false })(EvaluationForm)
const selector = formValueSelector('evaluationForm')

const mapStateToProps = state => ({
    projects: state.project.list,
    checklists: state.checklist.list,
    checklist: state.evaluation.checklist,
    score: state.evaluation.score,
    completion: state.evaluation.completion,
    officeData: state.evaluation.officeData,
    equipments: state.evaluation.equipments
})
const mapDispatchToProps = dispatch => bindActionCreators({ init, getChecklists, selectChecklist, getTree, getProjects, updateScore, getOfficeData, prepareToShow, showUpdate }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EvaluationForm)