import React from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'
import Select from './select'

export default props => (
    <Grid cols={props.cols || 12}>
        <div className="form-group">
            <If test={props.label}>
                <label>{props.label}</label>
            </If>
            <div className="input-group">
                <div className="input-group-addon">
                    <i className={`fa fa-${props.icon}`}></i>
                </div>
                <Select {...props} onlyCombo={true} readOnly={props.readOnly}/>
            </div>
        </div>
    </Grid>
)

