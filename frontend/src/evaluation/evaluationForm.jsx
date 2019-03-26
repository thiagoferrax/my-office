import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reduxForm, Field } from 'redux-form'

import { init, selectChecklist, updateScore } from './evaluationActions'
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

    getSprintList() {
        const sprints = []
        sprints.push({ id: 1, name: 'North' })
        sprints.push({ id: 2, name: 'South' })
        sprints.push({ id: 3, name: 'West' })
        sprints.push({ id: 4, name: 'East' })

        return sprints
    }

    getPosiblePositions() {
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

        const { projects, checklists, checklist, handleSubmit, readOnly, selectChecklist } = this.props
        const data = [
            {
                chairPosition: 'south', x: 0, y: 0,
                equipments: {
                    cpu: 'Dual core 2.4 GHz, 16 GB RAM, 256 GB HD',
                    monitor: 'HP V197 18.5-inch',
                    keyboard: 'HP Ultrathin Wireless Keyboard',
                    phone: 'Cisco Phone IP 7960G/7940G',
                    chair: '817L Kare Ergonomic Office Chair',
                    mouse: 'HP USB 2 Button Optical Mouse'
                },
            },
            {
                chairPosition: 'south', x: 1, y: 0,
                equipments: {
                    cpu: 'Dual core 2.4 GHz, 16 GB RAM, 256 GB HD',
                    monitor: 'HP V197 18.5-inch',
                    keyboard: 'HP Ultrathin Wireless Keyboard',
                    phone: 'Cisco Phone IP 7960G/7940G',
                    chair: '817L Kare Ergonomic Office Chair',
                    mouse: 'HP USB 2 Button Optical Mouse'
                }
            },
            { chairPosition: 'south', x: 2, y: 0 },
            { chairPosition: 'south', x: 3, y: 0 },
            { chairPosition: 'west', x: 0, y: 1 },
            { chairPosition: 'east', x: 1, y: 1 },
            {
                chairPosition: 'north-west', x: 2, y: 1,
                equipments: {
                    cpu: 'Dual core 2.4 GHz, 8 GB RAM, 512 GB HD',
                    monitor: 'HP V197 18.5-inch',
                    keyboard: 'HP Ultrathin Wireless Keyboard',
                    phone: 'Cisco Phone IP 7960G/7940G',
                    chair: '817L Kare Ergonomic Office Chair'
                }
            },
            { chairPosition: 'south-west', x: 2, y: 2 },
            { chairPosition: 'north-east', x: 3, y: 1 },
        ]
        return (
            <form role='form' onSubmit={handleSubmit}>
                <div className='box-body'>
                    <Field name='projectId' label='Room' cols='12 3'
                        component={Select} readOnly={readOnly} options={projects} optionValue='id' optionLabel='name' autoFocus={true} />
                    <Field name='sprint' label='Chair direction' cols='12 3'
                        component={Select} readOnly={readOnly}
                        options={this.getSprintList()} optionValue='id' optionLabel='name' />
                    <Field name='x' label='X position' cols='12 2'
                        component={Select} readOnly={readOnly}
                        options={this.getPosiblePositions()} optionValue='id' optionLabel='name' />
                    <Field name='y' label='Y position' cols='12 2'
                        component={Select} readOnly={readOnly}
                        options={this.getPosiblePositions()} optionValue='id' optionLabel='name' />

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
                                    <i className="fa fa-plus"></i>
                                </button>
                                <button type='button' className='btn btn-default'
                                    onClick={init} title="Clear">
                                    <i className="icon ion-md-close"></i>
                                </button>
                            </div>
                        </If>
                    </Grid>

                    <If test={data && data.length > 0}>
                        <Grid key={`checklist_${checklist.id}`} cols='12'>
                            <div className="box_ box-default">
                                <div className="box-header with-border">
                                    <i className="fa fa-check"></i>
                                    <h3 className="box-title">MY OFFICE - {checklist.description}</h3>
                                </div>
                                <div className="box-body">
                                    <OfficeMap data={data} />
                                </div>
                            </div>
                        </Grid >
                    </If>
                </div>
                <div className='box-footer text-right'>
                    <button type='submit' className={`btn btn-${this.props.submitClass}`}>
                        {this.props.submitLabel}
                    </button>
                    <button type='button' className='btn btn-default'
                        onClick={this.props.init}>Cancel</button>
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
    completion: state.evaluation.completion
})
const mapDispatchToProps = dispatch => bindActionCreators({ init, getChecklists, selectChecklist, getTree, getProjects, updateScore }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EvaluationForm)