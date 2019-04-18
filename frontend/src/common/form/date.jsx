import React, { Component } from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'
import $ from 'jquery'
import './form.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default class ItemList extends Component {

    render() {
        return (
            <Grid cols={this.props.cols || 12}>
                <div className="form-group">
                    <If test={this.props.label}>
                        <label>{this.props.label}</label>
                    </If>
                    <div className="input-group date removeZIndex">
                        <div className="input-group-addon">
                            <i className="fa fa-calendar"></i>
                        </div>
                        
                        <DatePicker className="datePicker"
                            selected={this.props.input.value ? new Date(this.props.input.value) : null}
                            onChange={this.props.input.onChange}
                        />
                    </div>
                </div>
            </Grid>
        )
    }
}