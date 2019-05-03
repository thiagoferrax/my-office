import React from 'react'
import TimelineItem from './timelineItem'
import ContentHeader from './contentHeader'
import Content from './content'

export default props => {
    if (!props.data) {
        return <React.Fragment></React.Fragment>
    }

    return (
        <div>
            <ContentHeader title='Timeline' small='Main Events' />
            <Content>
                <ul className="timeline">
                    {getTimelineItems(props.data)}
                </ul>
            </Content>
            <br />
            <br />
        </div>
    )
}

const getTimelineItems = (data) => {
    const functions = {roomItem, userItem, deskItem, employeeItem}

    let dates = data && Object.keys(data)
    dates = dates && dates.sort((d1, d2) => new Date(d2) - new Date(d1))
    return dates && dates.reduce((items, day) => {
        items.push(date(day))
        const sortedData = data[day].sort((d1, d2) => new Date(d2.data.time) - new Date(d1.data.time))
        sortedData.forEach(log => items.push(functions[`${log.type}Item`](log.data)))
        return items
    }, [])
}

const roomItem = ({ room, user, formattedTime }) => {
    return (
        <TimelineItem
            key={`rooms_${room}_${user}_${formattedTime}`}
            time={formattedTime}
            icon="cube" color="aqua">
            <a href="/#/rooms">{room}</a> was created by <a href="#">{user}</a>
        </TimelineItem>
    )
}

const userItem = ({ user, formattedTime }) => {
    return (
        <TimelineItem
            key={`users_${user}_${formattedTime}`}
            time={formattedTime}
            icon="user" color="red">
            <a href="#">{user}</a> was registered in <a href="#">My Office</a>
        </TimelineItem>
    )
}

const deskItem = ({ sprint, room, user, employee, formattedTime }) => {
    return (
        <TimelineItem
            key={`desks_${sprint}_${room}_${user}_${employee}_${formattedTime}`}
            time={formattedTime}
            icon="desktop" color="green">
            A new workstation in <a href="/#/rooms">{room}</a> was created by <a href="#">{user}</a>
        </TimelineItem>
    )
}

const employeeItem = ({ employee, user, formattedTime }) => {
    return (
        <TimelineItem
            key={`employees_${employee}_${user}_${formattedTime}`}
            time={formattedTime}
            icon="check" color="yellow">
            <a href="/#/employees">{employee}</a> was created by <a href="#">{user}</a>
        </TimelineItem>
    )
}

const date = (date) => {
    return (
        <li key={`dates_${date}`} className="time-label">
            <span className="bg-white">
                {date}
            </span>
        </li>
    )
}