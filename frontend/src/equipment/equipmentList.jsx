import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getList, prepareToShow, showUpdate, showDelete } from './equipmentActions'

class EquipmentList extends Component {

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
        return list.map(equipment => (
            <tr key={equipment.id}>
                <td>{equipment.patrimony}</td>
                <td>{equipment.type}</td>
                <td>{equipment.date ? this.getFormatedDate(equipment.date) : '-'}</td>
                <td>
                    <button className='btn btn-default' onClick={() => this.props.prepareToShow(equipment.id, showUpdate)}>
                        <i className='icon ion-md-create'></i>
                    </button>
                    <button className='btn btn-danger' onClick={() => this.props.prepareToShow(equipment.id, showDelete)}>
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
                            <th>Patrimony</th>
                            <th>Type</th>
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

const mapStateToProps = state => ({list: state.equipment.list})
const mapDispatchToProps = dispatch => bindActionCreators({getList, prepareToShow, showUpdate, showDelete}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(EquipmentList)