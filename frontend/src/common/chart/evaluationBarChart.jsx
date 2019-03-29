import React from 'react'
import BarChart from './barChart'

export default props => {
    const data = getBarChartData(props.evaluations, props.room.id)

    const dateInterval = getDateInterval(props.evaluations, props.room.id)

    if (!data) {
        return <React.Fragment />
    }

    return (
        <BarChart
            cols={props.cols}
            data={data}
            room={props.room.name}
            summaryData={props.summaryData}
            dateInterval={dateInterval} />
    )
}

const getDataSet = (datasets, checklistId) => {
    return datasets.filter(dataset => dataset.label === checklistId)
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

const getFormatedDate = (isoDate) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }

    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', options)
}

const getDateInterval = (evaluations, roomId) => {
    const roomEvaluations =
        evaluations.filter(evaluation => evaluation.roomId === roomId).sort((e1, e2) => e1.sprint - e2.sprint)

    if (!roomEvaluations.length) {
        return
    }

    const startDate = getFormatedDate(roomEvaluations[0].date)
    if (roomEvaluations.length === 1) {
        return startDate
    } else {
        const endDate = getFormatedDate(roomEvaluations[roomEvaluations.length - 1].date)
        if(startDate === endDate) {
            return startDate
        }
        
        return startDate + ' - ' + endDate
    }
}

const getBarChartData = (evaluations, roomId) => {
    const roomEvaluations =
        evaluations.filter(evaluation => evaluation.roomId === roomId).sort((e1, e2) => e1.sprint - e2.sprint)

    if (!roomEvaluations.length) {
        return
    }

    let color = 0
    const barChartData = roomEvaluations.reduce((map, evaluation) => {
        const sprint = 'Sprint ' + evaluation.sprint
        const checklist = evaluation.checklistDescription

        if (!map.labels.includes(sprint)) {
            map.labels.push(sprint)
        }

        const dataset = getDataSet(map.datasets, checklist)
        const index = map.labels.indexOf(sprint)
        if (dataset && dataset.length) {
            dataset[0].data[index] = evaluation.score
        } else {
            let data = []
            data[index] = evaluation.score
            map.datasets.push({
                label: checklist,
                data,
                borderWidth: 1.5,
                backgroundColor: getChartColor(color),
                borderColor: getChartBorderColor(color)
            })
            color++
        }

        return map
    }, { labels: [], datasets: [] })

    return barChartData
}