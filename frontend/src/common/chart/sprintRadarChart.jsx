import React from 'react'
import RadarChart from './radarChart'

const MAX_DATASETS = 1

export default props => {     
    const chartData = getRadarChartData(props.desks)

    if(chartData && chartData.categories > 2) {
        return (<RadarChart cols={props.cols} data={chartData} room={props.room}/>)
    } else {
        return (<React.Fragment/>)
    }
}

const getDataSet = (datasets, employeeId) => {
    return datasets.filter(dataset => dataset.label === employeeId)
}

const getChartColor = (index) => {

    const colors = [
        'rgb(0, 192, 239, .4)',
        'rgb(216, 27, 96, .4)',
        'rgb(104,115,140, .4)',
        'rgb(48, 187, 187, .4)',
        'rgb(11, 120, 206, .4)',
        'rgb(255, 119, 1, .4)',
        'rgb(17, 17, 17, .4)',
        'rgb(96, 92, 168, .4)'
        
    ]

    if (index > colors.length) {
        index -= colors.length
    }
    return colors[index]
}

const getChartBorderColor = (index) => {
    const colors = [
        'rgb(0, 192, 239)',
        'rgb(216, 27, 96)',
        'rgb(104,115,140)',
        'rgb(48, 187, 187)',
        'rgb(11, 120, 206)',
        'rgb(255, 119, 1)',
        'rgb(17, 17, 17)',
        'rgb(96, 92, 168)'
    ]

    if (index > colors.length) {
        index -= colors.length
    }
    return colors[index]
}

const getRadarChartData = (desks) => {
    let color = 0
    let datasets = 0
    const RadarChartData = desks && desks.reduce((map, desk) => {
        const sprint = 'Sprint ' + desk.sprint
        const employee = desk.employeeDescription

        if (!map.labels.includes(employee)) {
            map.labels.push(employee)
            map.categories++
        }

        const dataset = getDataSet(map.datasets, sprint)
        const index = map.labels.indexOf(employee)
        if (dataset && dataset.length) {
            dataset[0].data[index] = desk.score
        } else {
            let data = []
            data[index] = desk.score
            let hidden = datasets >= MAX_DATASETS
            map.datasets.push({
                label: sprint,
                data,
                notes: data,
                hidden,
                borderWidth: 1.5,
                backgroundColor: getChartColor(color),
                borderColor: getChartBorderColor(color)
            })
            color++
            datasets++
        }

        return map
    }, { labels: [], datasets: [],  categories: 0})

    return RadarChartData
}