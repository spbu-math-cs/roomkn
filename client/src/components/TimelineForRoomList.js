import {fromAPITime} from '../api/API';
import "./TimelineForRoomList.css"
import "./Timeline.css"
import React, {useContext, useEffect, useState} from 'react';
import {Box, Divider, Typography, useMediaQuery, useTheme} from "@mui/material";
import {CurrentUserContext} from "./Auth";
import useSomeAPI from "../api/FakeAPI";

function Reservation({
                         reservation,
                         fromTimelineDate,
                         untilTimelineDate,
                         show_reservation_labels=false,
                         is_current_reservation=false,
                         height=50
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
        if (!is_current_reservation && show_reservation_labels)
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

    const fromReservationDate = new Date(fromReservationObj.date + " " + fromReservationObj.time + "Z")
    const untilReservationDate = new Date(untilReservationObj.date + " " + untilReservationObj.time + "Z")

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

    const sx_row = {
        top: 0,
        left: leftOffset,
        width: reservationWidth,
        height: height,
        position: "absolute"
    }


    const sx_wrapper = {
        color: "black",
        background: "darkorchid",
        borderRadius: 0,
        height: height,
        zIndex: -1,
    }
    if (is_current_reservation) {
        sx_wrapper.background = "#9999ff77"
        sx_wrapper.zIndex = 1
    }

    if (show_reservation_labels) {
        return (
            <Box sx={sx_row}>
                <Box sx={sx_wrapper}>
                    <Box sx={{
                        writingMode: "sideways-lr",
                        height: "100%",
                        textAlign: "center",
                    }}>
                        <Box className="reservation-time">
                            <Typography className='reservation-time-label'>
                                {fromAPITime(reservation.from).time} - {fromAPITime(reservation.until).time}
                            </Typography>
                        </Box>
                        <Box className="reservation-user">
                            <Box className='reservation-user-label'>
                                {reservedUsername}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        )
    } else {
        return (
            <Box sx={sx_row}>
                <Box sx={sx_wrapper}/>
            </Box>
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

function DividerTimeline ({dividerDate, fromTimelineDate, untilTimelineDate}) {
    const row_style = getDividerRowStyle(dividerDate, fromTimelineDate, untilTimelineDate)

    return (
        <Divider orientation="vertical" flexItem sx={{
            position: "absolute",
            height: "100%",
            borderColor: "black",
            borderRightWidth: 2,
            top: 0,
            left: row_style.left,
        }}/>
    )
}

function HourDividerTimeline({dividerDate, fromTimelineDate, untilTimelineDate, show_divider_label}) {
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
        let day = dividerDate.getUTCDate()
        let month = dividerDate.getUTCMonth() + 1
        if (day < 10) {
            day = "0" + day
        }
        if (month < 10) {
            month = "0" + month
        }
        show = day + "." + month

        fontSize = fontSize + 5
    }

    let hour_label = <></>

    if (show_divider_label) {
        hour_label = (
            <Box fontSize={fontSize} sx={{
                position: "absolute",
                top: -(fontSize + margin_bottom),
                left: row_style.left,
            }}> {show} </Box>
        )
    }

    return (
        <>
            {hour_label}
            <Divider orientation="vertical" flexItem sx={{
                position: "absolute",
                height: "100%",
                borderColor: "black",
                borderRightWidth: 1,
                top: 0,
                left: row_style.left,
            }}/>
        </>
    )
}

function updateDate(date, diff) {
    date.setUTCDate(date.getUTCDate() + diff)
    return date
}

function Timeline({
                      reservations,
                      fromTimelineDate = null,
                      untilTimelineDate = null,
                      show_time_labels=false,
                      show_reservation_labels=false,
                      currentReservation=null,
                      height=50
                  }) {

    const theme = useTheme();

    let time_labels_modifier = 1;

    if (useMediaQuery(theme.breakpoints.down('lg')))
        time_labels_modifier = 2
    if (useMediaQuery(theme.breakpoints.down('md')))
        time_labels_modifier = 3
    if (useMediaQuery(theme.breakpoints.down('sm')))
        time_labels_modifier = 4


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

    const timeLineBorder = 1



    const reservationsList = []

    if (can_draw) {
        reservations.forEach((reservation) => {
            reservationsList.push(
                <Reservation
                    reservation={reservation}
                    fromTimelineDate={fromTimelineDate}
                    untilTimelineDate={untilTimelineDate}
                    show_reservation_labels={show_reservation_labels}
                    height={height}
                />
            )
        })
    }


    function getStartDate(date) {
        let newDate = new Date(date)
        newDate.setUTCHours(0, 0)
        // while (newDate < date) newDate.setDate(newDate.getDate() + 1)/* = new Date(updateDate(newDate, +1))*/
        return newDate
    }

    const dividersList = []
    const hourDividers = []

    const daysCount = Math.ceil((untilTimelineDate.getTime() - getStartDate(fromTimelineDate).getTime()) / 1000 / 60 / 60 / 24) * time_labels_modifier

    let deltaHours = 1

    if (daysCount >= 2) deltaHours = 2
    if (daysCount >= 3) deltaHours = 3
    if (daysCount >= 4) deltaHours = 4
    if (daysCount >= 5) deltaHours = 6
    if (daysCount >= 8) deltaHours = 8
    if (daysCount >= 10) deltaHours = 12
    if (daysCount >= 24) deltaHours = 24

    if (can_draw) {
        hourDividers.push(<HourDividerTimeline dividerDate={fromTimelineDate}
                                               fromTimelineDate={fromTimelineDate}
                                               untilTimelineDate={untilTimelineDate}
                                               show_divider_label={show_time_labels}
                                               show_reservation_labels={show_reservation_labels}
                                               is_current_reservation={false}
                                               height={height}
        />)

        for (let dividerDate = getStartDate(fromTimelineDate); dividerDate < untilTimelineDate; dividerDate = new Date(updateDate(dividerDate, +1))) {

            const dividerHourZeroDate = new Date(dividerDate)
            dividerHourZeroDate.setUTCHours(0, 0)
            if (fromTimelineDate <= dividerHourZeroDate && dividerHourZeroDate <= untilTimelineDate) {
                dividersList.push(<DividerTimeline dividerDate={dividerHourZeroDate}
                                                   fromTimelineDate={fromTimelineDate}
                                                   untilTimelineDate={untilTimelineDate}
                                                   show_reservation_labels={show_reservation_labels}
                />)
            }

            for (let i = fromTimelineDate.getUTCHours(); i < 24; i += deltaHours) {
                const dividerHourDate = new Date(dividerDate)
                dividerHourDate.setUTCHours(i, 0)

                if (fromTimelineDate <= dividerHourDate && dividerHourDate <= untilTimelineDate) {
                    // if ((deltaHours === 12 && i === 12)) {
                    //     show_divider_label = false
                    // }

                    hourDividers.push(<HourDividerTimeline dividerDate={dividerHourDate}
                                                           fromTimelineDate={fromTimelineDate}
                                                           untilTimelineDate={untilTimelineDate}
                                                           show_divider_label={show_time_labels}
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
        <Box sx={{
            height: height,
            width: "100%",
            position: "relative",
            border: timeLineBorder,
        }}>
            <Box sx={{
                height: height,

            }}>
                {label}
            </Box>
            {reservationsList}
            {dividersList}
            {hourDividers}
        </Box>
    )
}

export default Timeline
