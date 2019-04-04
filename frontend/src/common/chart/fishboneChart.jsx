import React from 'react'
import FishboneChart from 'fishbone-chart'
import Chart from './chart'

export default props => {
    if (!props.data) {
        return <React.Fragment></React.Fragment>
    }

    const sprints = Object.values(props.data)
    const employees = Object.values(sprints)
    let hasData = false
    employees.forEach(data => {
        if (Object.values(data).length > 0) {
            hasData = true
        }
    })

    if (!hasData) {
        return <React.Fragment></React.Fragment>
    }

    return (
        <Chart
            cols={props.cols}
            icon='fa fa-bug'
            title={`CAUSE AND EFFECT - ${props.room}`}
            footerText='Radar of average score per category'>
             <FishboneChart data={props.data} />
        </Chart>
    )
}