import React from 'react'
import Grid from '../layout/grid'
import If from '../operator/if'

export default props => (
    <Grid cols={props.cols || 12}>
        <If test={props.label}>
            <label>{props.label}</label>
        </If>
        <div class="input-group">
            <span class="input-group-addon"><i class="fa fa-envelope"></i></span>
            <input {...props.input}
                placeholder={props.placeholder}
                readOnly={props.readOnly} type="email" class="form-control" />
        </div>
    </Grid>
)

