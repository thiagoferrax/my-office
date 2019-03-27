import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field } from 'redux-form'

import { init, selectChecklist, updateScore, getOfficeData, prepareToShow, showUpdate } from './evaluationActions'
import { getList as getChecklists, getTree } from '../checklist/checklistActions'
import { getList as getProjects } from '../project/projectActions'
import Tree from 'tree-slide-bar'
import If from '../common/operator/if'
import Grid from '../common/layout/grid'
import ProgressBar from '../common/widget/progressBar'
import OfficeMap from 'office-map'

import Select from '../common/form/select'

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

    updateChecklistScore(tree) {
        this.props.updateScore(tree)
    }

    getChecklist(checklist) {
        return (
            <Grid cols='12'>
                <div className="box_ box-default box_evaluations">
                    <div className="box-header">
                        <i className={`fa fa-check`}></i>
                        <h3 className="box-title">&nbsp;&nbsp;MY OFFICE</h3>
                    </div>
                    <ProgressBar score={this.props.score} completion={this.props.completion} />
                    <div className="box-body">
                        <Field
                            name='checklist'
                            component={Tree}
                            tree={checklist}
                            onChange={tree => this.updateChecklistScore(tree)}
                        />
                    </div>
                    <ProgressBar score={this.props.score} completion={this.props.completion} />
                </div>
            </Grid >
        )
    }

    render() {

        const { projects, checklists, checklist, handleSubmit, readOnly, selectChecklist, getOfficeData, officeData,  prepareToShow, showUpdate} = this.props
        
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
                    <Field name='x' label='X position' cols='12 2'
                        component={Select} readOnly={readOnly}
                        options={this.getPossiblePositions()} optionValue='id' optionLabel='name' />
                    <Field name='y' label='Y position' cols='12 2'
                        component={Select} readOnly={readOnly}
                        options={this.getPossiblePositions()} optionValue='id' optionLabel='name' />

                    <Grid cols='12 2'>
                        <If test={readOnly}>
                            <div className='buttons_checklist_form'>
                                <button type='submit' className='btn btn-danger'>
                                    <i className="icon ion-md-trash"></i>
                                </button>
                                <button type='button' className='btn btn-default'
                                    onClick={init}>
                                    <i className="icon ion-md-close"></i>
                                </button>
                            </div>
                        </If>
                        <If test={!readOnly}>
                            <div className='buttons_checklist_form'>
                                <button type='submit' className='btn btn-primary' title="Save">
                                    <i className="fa fa-check"></i>
                                </button>
                                <button type='button' className='btn btn-default'
                                    onClick={init} title="Clear">
                                    <i className="icon ion-md-close"></i>
                                </button>
                            </div>
                        </If>
                    </Grid>

                    <If test={officeData && officeData.length > 0}>
                        <Grid key={`checklist_${checklist.id}`} cols='12'>
                            <div className="box_ box-default">
                                <div className="box-header with-border">
                                    <i className="fa fa-check"></i>
                                    <h3 className="box-title">MY OFFICE - {officeData[0] && officeData[0].room}</h3>
                                </div>
                                <div className="box-body">
                                    <OfficeMap data={officeData} onSelect={deskId => this.props.prepareToShow(deskId, showUpdate) }/>
                                </div>
                            </div>
                        </Grid >
                    </If>
                </div>
            </form>
        )
    }
}

EvaluationForm = reduxForm({ form: 'evaluationForm', destroyOnUnmount: false })(EvaluationForm)

const mapStateToProps = state => ({
    projects: state.project.list,
    checklists: state.checklist.list,
    checklist: state.evaluation.checklist,
    score: state.evaluation.score,
    completion: state.evaluation.completion,
    officeData:  state.evaluation.officeData
})
const mapDispatchToProps = dispatch => bindActionCreators({ init, getChecklists, selectChecklist, getTree, getProjects, updateScore, getOfficeData, prepareToShow, showUpdate }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EvaluationForm)