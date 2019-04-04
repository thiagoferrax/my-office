import React, {Component} from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'
import $ from 'jquery'
import './form.css'

export default class ItemList extends Component {
    componentDidMount() {
        $("document").ready(
            () => {
                $('#datepicker').datepicker({
                    autoclose: true,
                    todayHighlight: true
                })
            }
        )
    }

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
                        <input {...this.props.input} type="text" className="form-control pull-right" id="datepicker" 
                            placeholder={this.props.placeholder} />
                    </div>
                </div>
            </Grid>
        )
    }
}