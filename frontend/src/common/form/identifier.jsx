import React from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'
import './form.css'

export default props => (
    <Grid cols={props.cols || 12}>
        <div class="form-group">
            <If test={props.label}>
                <label>{props.label}</label>
            </If>
            <div class="input-group removeZIndex">
                <div class="input-group-addon">
                    <i class="fa fa-id-card"></i>
                </div>
                <input {...props.input}
                    placeholder={props.placeholder}
                    readOnly={props.readOnly}
                    type="text" class="form-control" />
            </div>
        </div>
    </Grid>
)

