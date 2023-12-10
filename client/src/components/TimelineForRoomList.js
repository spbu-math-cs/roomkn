import {fromAPITime} from '../api/API';
import "./TimelineForRoomList.css"
import React from 'react';

function Reservation({reservation, fromTimelineDate, untilTimelineDate}) {
    const fromReservationObj = fromAPITime(reservation.from)
    const untilReservationObj = fromAPITime(reservation.until)

    const fromReservationDate = new Date(fromReservationObj.date + " " + fromReservationObj.time)
    const untilReservationDate = new Date(untilReservationObj.date + " " + untilReservationObj.time)

    const fromTimelineTime = fromTimelineDate.getTime()
    const untilTimelineTime = untilTimelineDate.getTime()
    const fromReservationTime = fromReservationDate.getTime()
    const untilReservationTime = untilReservationDate.getTime()

    const realReservationFromTime = (fromReservationTime >= fromTimelineTime ? fromReservationTime : fromTimelineTime)
    const realReservationUntilTime = (untilReservationTime <= untilTimelineTime ? untilReservationTime : untilTimelineTime)

    const durationReservationsSeconds = (realReservationUntilTime - realReservationFromTime) / 1000
    const startReservationSeconds = (realReservationFromTime - fromTimelineTime) / 1000
    const timelineDurationSeconds = (untilTimelineTime - fromTimelineTime) / 1000

    const leftOffset = (startReservationSeconds / timelineDurationSeconds * 100) + "%"
    const reservationWidth = (durationReservationsSeconds / timelineDurationSeconds * 100) + "%"

    const row_style = {
        top: 0,
        left: leftOffset,
        width: reservationWidth,
        height: "50px"
    }

    return (
        <div className="for-rooms-reservation-row" style={row_style}>
            <div className="for-rooms-reservation-wrapper"/>
        </div>
    )
}

function DividerTimeline ({dividerDate, fromTimelineDate, untilTimelineDate}) {
    const dividerTime = dividerDate.getTime()
    const fromTimelineTime = fromTimelineDate.getTime()
    const untilTimelineTime = untilTimelineDate.getTime()

    const dividerSeconds = (dividerTime - fromTimelineTime) / 1000
    const timelineDurationSeconds = (untilTimelineTime - fromTimelineTime) / 1000

    const leftOffset = (dividerSeconds / timelineDurationSeconds * 100) + "%"

    const row_style = {
        top: 0,
        left: leftOffset,
    }

    return (
        <div className="for-rooms-divider-row" style={row_style}/>
    )
}

function dateFormat(date, format = "yyyy-mm-dd") {
    let mlz = ""
    if (date.getMonth() + 1 < 10) mlz = "0"
    let dlz = ""
    if (date.getDate() < 10) dlz = "0"
    const map = {
        mm: mlz + (date.getMonth() + 1),
        dd: dlz + date.getDate(),
        yyyy: date.getFullYear(),
        // yy: date.getFullYear().toString().slice(-2)
    }

    return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
}

function updateDate(date, diff) {
    const new_date = new Date(date)
    new_date.setDate(new_date.getDate() + diff)
    return dateFormat(new_date)
}

function TimelineForRoomList({reservations, fromTimelineDate = null, untilTimelineDate = null}) {
    if (reservations == null) return (
        <label className='for-rooms-reservations-not-found-label'>
            Can't get reservations list for this room.
        </label>
    )

    const reservationsList = []
    reservations.forEach((reservation) => {
        reservationsList.push(
            <Reservation
                reservation={reservation}
                fromTimelineDate={fromTimelineDate}

                untilTimelineDate={untilTimelineDate}
            />
        )
    })

    function getStartDate(date) {
        let newDate = new Date(date)
        newDate.setHours(0, 0)
        while (newDate < date) newDate = new Date(updateDate(newDate, +1))
        return newDate
    }

    const dividersList = []
    for (let dividerDate = getStartDate(fromTimelineDate); dividerDate < untilTimelineDate; dividerDate = new Date(updateDate(dividerDate, +1))) {
        dividersList.push(<DividerTimeline dividerDate={dividerDate} fromTimelineDate={fromTimelineDate} untilTimelineDate={untilTimelineDate}/>)
    }

    console.log("dividersList: " + dividersList.length)

    return (
        <div className="for-rooms-reservation-list-wrapper">
            <div className="for-rooms-reservation-list-background"/>
            {reservationsList}
            {dividersList}
        </div>
    )
}

export default TimelineForRoomList