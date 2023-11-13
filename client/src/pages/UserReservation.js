import {NavLink} from 'react-router-dom'

import ContentWrapper from '../components/Content';
import React, {useContext, useEffect} from 'react';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {fromAPITime} from "../api/API";

function EmptyReservationsPage() {
    return (
        <div>
            You have no reservations
        </div>
    )
}

function Reservation(reservation) {
    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)
    const from_date = new Date(from_obj.date + " " + from_obj.time)
    const until_date = new Date(until_obj.date + " " + until_obj.time)
    const room_id = reservation.room_id

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms/' + room_id)

    useEffect(() => triggerFetch(), [])

    if (statusCode === 200 && result != null && finished) {
        const room_name = result.name
        return <label>
            Комната {room_name}; с {from_date} по {until_date}
        </label>
    }
    return <div></div>
}

function useReservationsList(user_id) {
    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/by-user/' + user_id)

    useEffect(() => triggerFetch(), [])

    if (statusCode === 200 && finished && result != null) {
        return {
            reservations: result,
            triggerFetch: triggerFetch
        }
    }
}

function ReservationsList() {
    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    const reservations = useReservationsList(currentUser?.user_id)?.reservations

    if (!isAuthorized) return (
        <div>
            <label className='not-authorized-label'>
                You are not authorized. To gain ability to get your reservations, please,
            </label>
            <NavLink className='not-authorized-link' to='/sign-in'>
                log into the system.
            </NavLink>
        </div>
    )

    console.log("reservations: " + reservations)

    const reservationsList = []
    reservations?.forEach((reservation) => {
        reservationsList.push (
            // <li>
            <Reservation reservation={reservation}/>
            // </li>
        )
    })

    if (reservationsList.length === 0) {
        return EmptyReservationsPage()
    }

    return (
        <div className="reservation-list">
            {reservationsList}
        </div>
    )
}

function UserReservations() {
    const page_name = "Reservations"

    return (
        <ContentWrapper page_name = {page_name}>
            {ReservationsList()}
        </ContentWrapper>
    )
}

export default UserReservations;