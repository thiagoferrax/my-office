import React from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'
import Select from './select'

export default props => (
    <Grid cols={props.cols || 12}>
        <div class="form-group">
            <If test={props.label}>
                <label>{props.label}</label>
            </If>
            <div class="input-group">
                <div class="input-group-addon">
                    <i class={`fa fa-${props.icon}`}></i>
                </div>
                <Select {...props} onlyCombo={true}/>
            </div>
        </div>
    </Grid>
)

