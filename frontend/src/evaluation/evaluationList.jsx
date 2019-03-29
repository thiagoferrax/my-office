import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getList, showUpdate, showDelete } from './evaluationActions'

class EvaluatonList extends Component {

    componentWillMount() {
        this.props.getList()
    }

    getFormatedDate(isoDate) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        
        const date = new Date(isoDate)
        return `${date.toLocaleDateString('en-US', options)} at ${date.toLocaleTimeString('en-US')}`
    }

    renderRows() {
        const list = this.props.list || []
        return list.map(evaluation => (
            <tr key={evaluation.id}>
                <td>{evaluation.id}</td>                
                <td>{evaluation.chairDirection}</td>                
                <td>{evaluation.x}</td>                
                <td>{evaluation.y}</td>                
                <td>{evaluation.projectName}</td>                
                <td>{this.getFormatedDate(evaluation.date)}</td>
                <td>
                    <button className='btn btn-default' onClick={() => this.props.showUpdate(evaluation)}>
                        <i className='icon ion-md-create'></i>
                    </button>
                    <button className='btn btn-danger' onClick={() => this.props.showDelete(evaluation)}>
                        <i className='icon ion-md-trash'></i>
                    </button>
                </td>
            </tr>
        ))
    }

    render() {
        return (
            <div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Desk identifier</th>
                            <th>Chair direction</th>
                            <th>X position</th>
                            <th>Y position</th>
                            <th>Room</th>
                            <th>Created at</th>
                            <th className='table-actions'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows()}
                    </tbody>
                </table>
            </div>
        )
    }
}

const mapStateToProps = state => ({list: state.evaluation.list})
const mapDispatchToProps = dispatch => bindActionCreators({getList, showUpdate, showDelete}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EvaluatonList)