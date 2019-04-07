import React from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'
import './form.css'

export default props => (
    <Grid cols={props.cols || 12}>
        <div className="form-group">
            <If test={props.label}>
                <label>{props.label}</label>
            </If>
            <div className="input-group removeZIndex">
                <div className="input-group-addon">
                    <i className="fa fa-phone"></i>
                </div>
                <input {...props.input}
                    placeholder={props.placeholder}
                    readOnly={props.readOnly}
                    type="text" className="form-control" data-inputmask="&quot;mask&quot;: &quot;(999) 99999-9999&quot;" data-mask="" />
            </div>
        </div>
    </Grid>
)

