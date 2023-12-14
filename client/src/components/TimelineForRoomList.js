import {fromAPITime} from '../api/API';
import "./TimelineForRoomList.css"
import React from 'react';
import {Box} from "@mui/material";

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

function getDividerRowStyle(dividerDate, fromTimelineDate, untilTimelineDate) {
    const dividerTime = dividerDate.getTime()
    const fromTimelineTime = fromTimelineDate.getTime()
    const untilTimelineTime = untilTimelineDate.getTime()

    const dividerSeconds = (dividerTime - fromTimelineTime) / 1000
    const timelineDurationSeconds = (untilTimelineTime - fromTimelineTime) / 1000

    const leftOffset = (dividerSeconds / timelineDurationSeconds * 100) + "%"

    return {
        top: 0,
        left: leftOffset,
    }
}

function DividerTimeline ({dividerDate, fromTimelineDate, untilTimelineDate}) {
    const row_style = getDividerRowStyle(dividerDate, fromTimelineDate, untilTimelineDate)

    return (
        <div className="for-rooms-divider-row" style={row_style}/>
    )
}

function HourDividerTimeline({dividerDate, fromTimelineDate, untilTimelineDate, show_divider_label}) {
    const row_style = getDividerRowStyle(dividerDate, fromTimelineDate, untilTimelineDate)

    let fontSize = 18
    const margin_bottom = 5;

    const hours = dividerDate.getHours()
    let minutes = dividerDate.getMinutes()
    if (minutes < 10) {
        minutes = "0" + minutes
    }


    let show = hours + ":" + minutes;

    if (dividerDate.getHours() === 0) {
        let day = dividerDate.getDate()
        let month = dividerDate.getMonth() + 1
        if (day < 10) {
            day = "0" + day
        }
        if (month < 10) {
            month = "0" + month
        }
        show = day + "." + month

        fontSize = fontSize + 5
    }

    const boxStyle = {
        position: "relative",
        top: "-" + (fontSize + margin_bottom) + "px",
        // left: "-50%"
    }

    let hour_label = <></>

    if (show_divider_label) {
        hour_label = (
            <Box style={boxStyle} fontSize={fontSize}> {show} </Box>
        )
    }

    return (
        <div className="for-rooms-divider-hour-row-wrapper" style={row_style}>
            {hour_label}
            <div className="for-rooms-divider-hour-row"/>

        </div>
    )
}

function updateDate(date, diff) {
    date.setDate(date.getDate() + diff)
    return date
}

function TimelineForRoomList({reservations, fromTimelineDate = null, untilTimelineDate = null, is_first_timeline=false}) {
    let label = <></>

    let can_draw = true

    if (reservations == null) {
        can_draw = false
        label = (
            <label className='for-rooms-reservations-not-found-label'>
                Can't get reservations list for this room.
            </label>
        )
    }

    const days_count_to_request = (untilTimelineDate.getTime() - fromTimelineDate.getTime()) / (1000 * 3600 * 24);
    const is_too_long_time_period = days_count_to_request > 14;

    if (is_too_long_time_period) {
        can_draw = false
        label = (
            <label className='for-rooms-reservations-too-long-time-period'>
                Time period is too long to show
            </label>
        )
    }



    const reservationsList = []

    if (can_draw) {
        reservations.forEach((reservation) => {
            reservationsList.push(
                <Reservation
                    reservation={reservation}
                    fromTimelineDate={fromTimelineDate}

                    untilTimelineDate={untilTimelineDate}
                />
            )
        })
    }


    function getStartDate(date) {
        let newDate = new Date(date)
        newDate.setHours(0, 0)
        while (newDate < date) newDate.setDate(newDate.getDate() + 1)/* = new Date(updateDate(newDate, +1))*/
        return newDate
    }

    const dividersList = []
    const hourDividers = []

    const daysCount = Math.floor((untilTimelineDate.getTime() - getStartDate(fromTimelineDate).getTime()) / 1000 / 60 / 60 / 24)

    let deltaHours = 1

    if (daysCount >= 2) deltaHours = 2
    if (daysCount >= 3) deltaHours = 3
    if (daysCount >= 4) deltaHours = 4
    if (daysCount >= 5) deltaHours = 6
    if (daysCount >= 8) deltaHours = 8
    if (daysCount >= 10) deltaHours = 12
    // if (daysCount >= 16) deltaHours = 1
    if (daysCount >= 24) deltaHours = 24
    // if (daysCount >= 48) deltaHours = 24

    // deltaHours = daysCount

    if (can_draw) {
        for (let dividerDate = getStartDate(fromTimelineDate); dividerDate < untilTimelineDate; dividerDate = new Date(updateDate(dividerDate, +1))) {
            dividersList.push(<DividerTimeline dividerDate={dividerDate} fromTimelineDate={fromTimelineDate}
                                               untilTimelineDate={untilTimelineDate}/>)

            for (let i = 0; i < 24; i += deltaHours) {
                const dividerHourDate = new Date(dividerDate)
                dividerHourDate.setHours(i, 0)

                let show_divider_label = is_first_timeline

                if (deltaHours === 12 && i === 12) {
                    show_divider_label = false
                }

                hourDividers.push(<HourDividerTimeline dividerDate={dividerHourDate} fromTimelineDate={fromTimelineDate}
                                                       untilTimelineDate={untilTimelineDate} show_divider_label={show_divider_label}/>)
            }
        }
    }

    return (
        <div className="for-rooms-reservation-list-wrapper">
            <div className="for-rooms-reservation-list-background">
                {label}
            </div>
            {reservationsList}
            {dividersList}
            {hourDividers}
        </div>
    )
}

export default TimelineForRoomList
