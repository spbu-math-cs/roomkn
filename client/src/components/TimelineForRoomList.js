import {fromAPITime} from '../api/API';
import "./TimelineForRoomList.css"
import "./Timeline.css"
import React, {useContext, useEffect, useState} from 'react';
import {Box} from "@mui/material";
import {CurrentUserContext} from "./Auth";
import useSomeAPI from "../api/FakeAPI";

function Reservation({
                         reservation,
                         fromTimelineDate,
                         untilTimelineDate,
                         show_reservation_labels=false,
                         is_current_reservation=false,
                         height="100px"
}) {

    const {currentUser} = useContext(CurrentUserContext)

    let [reservedUsername, setReservedUsername] = useState('')

    let {triggerFetch} = useSomeAPI('/api/v0/users/' + reservation.user_id, null, 'GET', userCallback)

    function userCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setReservedUsername(result?.username)
        }
    }

    useEffect(() => {
        if (!is_current_reservation)
            triggerFetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reservation])


    useEffect(() => {
        if (is_current_reservation) {
            setReservedUsername(currentUser.username)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser])

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
        height: height
    }


    let prefix = ""
    if (!show_reservation_labels) {
        prefix = "for-rooms-"
    }



    let reservation_class_name = prefix + "reservation-wrapper"
    if (is_current_reservation) {
        reservation_class_name = prefix + "reservation-current-wrapper"
    }

    if (show_reservation_labels) {
        return (
            <div className="reservation-row" style={row_style}>
                <div className={reservation_class_name}>
                    <div className="reservation-info">
                        <div className="reservation-time">
                            <label className='reservation-time-label'>
                                {fromAPITime(reservation.from).time} - {fromAPITime(reservation.until).time}
                            </label>
                        </div>
                        <div className="reservation-user">
                            <label className='reservation-user-label'>
                                {reservedUsername}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="for-rooms-reservation-row" style={row_style}>
                <div className={reservation_class_name}/>
            </div>
        )
    }
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

function DividerTimeline ({dividerDate, fromTimelineDate, untilTimelineDate, show_reservation_labels}) {
    const row_style = getDividerRowStyle(dividerDate, fromTimelineDate, untilTimelineDate)

    let prefix = ""
    if (!show_reservation_labels) {
        prefix = "for-rooms-"
    }

    return (
        <div className={prefix + "divider-row"} style={row_style}/>
    )
}

function HourDividerTimeline({dividerDate, fromTimelineDate, untilTimelineDate, show_divider_label, show_reservation_labels}) {
    const row_style = getDividerRowStyle(dividerDate, fromTimelineDate, untilTimelineDate)

    let fontSize = 10
    const margin_bottom = 5;

    const hours = dividerDate.getUTCHours()
    let minutes = dividerDate.getUTCMinutes()
    if (minutes < 10) {
        minutes = "0" + minutes
    }


    let show = hours + ":" + minutes;

    if (dividerDate.getUTCHours() === 0) {
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
    }

    let hour_label = <></>

    if (show_divider_label) {
        hour_label = (
            <Box style={boxStyle} fontSize={fontSize}> {show} </Box>
        )
    }

    let prefix = ""
    if (!show_reservation_labels) {
        prefix = "for-rooms-"
    }

    return (
        <div className={prefix + "divider-hour-row-wrapper"} style={row_style}>
            {hour_label}
            <div className={prefix + "divider-hour-row"}/>

        </div>
    )
}

function updateDate(date, diff) {
    date.setDate(date.getDate() + diff)
    return date
}

function Timeline({
                      reservations,
                      fromTimelineDate = null,
                      untilTimelineDate = null,
                      show_time_labels=false,
                      show_reservation_labels=false,
                      currentReservation=null,
                      height="100px"
                  }) {
    let label = <></>

    let can_draw = true

    let prefix = ""
    if (!show_reservation_labels) {
        prefix = "for-rooms-"
    }

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
                    show_reservation_labels={show_reservation_labels}
                />
            )
        })
    }


    function getStartDate(date) {
        let newDate = new Date(date)
        newDate.setHours(0, 0)
        // while (newDate < date) newDate.setDate(newDate.getDate() + 1)/* = new Date(updateDate(newDate, +1))*/
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
    if (daysCount >= 24) deltaHours = 24

    if (can_draw) {
        for (let dividerDate = getStartDate(fromTimelineDate); dividerDate < untilTimelineDate; dividerDate = new Date(updateDate(dividerDate, +1))) {
            const dividerHourZeroDate = new Date(dividerDate)
            dividerHourZeroDate.setUTCHours(0, 0)
            dividersList.push(<DividerTimeline dividerDate={dividerHourZeroDate}
                                               fromTimelineDate={fromTimelineDate}
                                               untilTimelineDate={untilTimelineDate}
                                               show_reservation_labels={show_reservation_labels}
            />)

            for (let i = 0; i < 24; i += deltaHours) {
                const dividerHourDate = new Date(dividerDate)
                dividerHourDate.setUTCHours(i, 0)

                let show_divider_label = show_time_labels

                console.log(fromTimelineDate, dividerHourDate)

                if (fromTimelineDate <= dividerHourDate && dividerHourDate <= untilTimelineDate) {
                    // if ((deltaHours === 12 && i === 12)) {
                    //     show_divider_label = false
                    // }

                    hourDividers.push(<HourDividerTimeline dividerDate={dividerHourDate}
                                                           fromTimelineDate={fromTimelineDate}
                                                           untilTimelineDate={untilTimelineDate}
                                                           show_divider_label={show_divider_label}
                                                           show_reservation_labels={show_reservation_labels}
                                                           is_current_reservation={false}
                                                           height={height}
                    />)
                }
            }
        }
    }

    if (currentReservation != null) {
        reservationsList.push(<Reservation
            reservation={currentReservation}
            fromTimelineDate={fromTimelineDate}
            untilTimelineDate={untilTimelineDate}
            show_reservation_labels={show_reservation_labels}
            is_current_reservation={true }
            height={height}
        />)
    }

    return (
        <div className={prefix + "reservation-list-wrapper"}>
            <div className={prefix + "reservation-list-background"}>
                {label}
            </div>
            {reservationsList}
            {dividersList}
            {hourDividers}
        </div>
    )
}

export default Timeline
