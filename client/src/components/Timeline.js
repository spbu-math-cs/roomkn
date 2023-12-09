import React, {createContext, useContext, useEffect, useState} from 'react';
import {fromAPITime, toAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "./Auth";

import {CurrentReservationContext} from "../pages/Room.js"
const Start_day_time = "09:00"
const Finish_day_time = "23:59"

function Reservation({reservation, is_current_reservation = false}) {

    let [reservedUsername, setReservedUsername] = useState('')

    let {triggerFetch} = useSomeAPI('/api/v0/users/' + reservation.user_id, null, 'GET', userCallback)

    function userCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setReservedUsername(result?.username)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [reservation])

    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)

    const from_date = new Date(from_obj.date + " " + from_obj.time)
    const until_date = new Date(until_obj.date + " " + until_obj.time)
    const day_start_date = new Date(until_obj.date + " " + Start_day_time)
    const day_finish_date = new Date(from_obj.date + " " + Finish_day_time)

    const day_finish_time = day_finish_date.getTime()
    const from_time = from_date.getTime()
    const day_start_time = day_start_date.getTime()
    const timeline_from_time = (from_time >= day_start_time ? from_time : day_start_time)
    const until_time = until_date.getTime()
    const timeline_finish_time = (from_time <= until_time ? until_time : day_finish_time)

    const old_duration_in_second = (timeline_finish_time - timeline_from_time) / 1000
    const duration_in_seconds = (old_duration_in_second >= 0 ? old_duration_in_second : 0)
    const from_start_in_seconds = (timeline_from_time - day_start_date.getTime()) / 1000
    const day_duration_in_seconds = 14 * 60 * 60

    const left_offset = (from_start_in_seconds / day_duration_in_seconds * 100) + "%"
    const reservation_width = (duration_in_seconds / day_duration_in_seconds * 100) + "%"

    const row_style = {
        top: 0,
        left: left_offset,
        width: reservation_width,
        height: "100px"
    }

    let reservation_class_name = "reservation-wrapper"
    if (is_current_reservation) {
        reservation_class_name = "reservation-current-wrapper"
    }

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
}

function Timeline({reservations, currentReservation = null}) {
    if (reservations == null) return (
        <label className='reservations-not-found-label'>
            Не удалось получить список бронирований для этого кабинета.
        </label>
    )

    console.log("reservations: " + reservations)

    const reservationsList = []
    reservations.forEach((reservation) => {
        reservationsList.push(
            // <li>
            <Reservation reservation={reservation}/>
            // </li>
        )
    })

    if (currentReservation != null) {
        reservationsList.push(<Reservation reservation={currentReservation} is_current_reservation={true}/>)
    }


    return (
        <div className="reservation-list-wrapper">
            <div className="reservation-list-background"/>
            {reservationsList}
        </div>
    )
}

export default Timeline