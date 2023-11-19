import './UserReservation.css';

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
}// eslint-disable-next-line react-hooks/exhaustive-deps

function Reservation({reservation, onDelete}) {

    // console.log('reservation1: ' + reservation1)

    // const reservation = reservation1.reservation

    console.log('reservation object: ' + reservation)
    console.log('from: ' + reservation.from)
    console.log('until: ' + reservation.until)
    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)
    // const from_date = new Date(from_obj.date + " " + from_obj.time)
    // const until_date = new Date(until_obj.date + " " + until_obj.time)
    const room_id = reservation.room_id

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms/' + room_id)

    let deleteReturned = useDeleteReservation(reservation.id)

    console.log("reservation number" + reservation.id)

    let deleteTriggerFetch = deleteReturned.triggerFetch
    let deleteFinished = deleteReturned.finished
    let deleteStatusCode = deleteReturned.statusCode

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const deleteSubmit = (e) => {
        e.preventDefault();

        deleteTriggerFetch()
        onDelete()
    };

    if (deleteFinished) {
        onDelete()
        if (statusCode === 200) {
            alert("Удалено!")
        }
        else alert("Error: " + deleteStatusCode)
        return <div></div>
    }

    if (statusCode === 200 && result != null && finished) {
        const room_name = result.name
        return <div>
            <label className='reservation-info-label'>
                Комната {room_name}; на {from_obj.date} с {from_obj.time} по {until_obj.time}
            </label>
            <button onClick={deleteSubmit}>
                Удалить
            </button>
        </div>
    }
    return <div></div>
}

function useDeleteReservation(reservationId) {
    let {triggerFetch, finished, statusCode} = useSomeAPI('/api/v0/reservations/' + reservationId, null, 'DELETE')
    return {triggerFetch, finished, statusCode}
}
function useReservationsList(user_id, deletedCount) {
    let {triggerFetch, result, finished, statusCode, failed} = useSomeAPI('/api/v0/reservations/by-user/' + user_id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        console.log("fetched")
        triggerFetch()
    }, [user_id, deletedCount])

    if (statusCode === 200 && finished && result != null && !failed) {
        return {
            reservations: result,
            triggerFetch: triggerFetch
        }
    }

    return {
        reservations: [],
        triggerFetch: () => {}
    }
}

function ReservationsList() {
    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    let deletedCount = 0

    const {reservations} = useReservationsList(currentUser?.user_id, deletedCount)

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

    function deleteSomething() {
        console.log("deletedCount increased")
        deletedCount = deletedCount + 1
    }

    const reservationsList = []
    console.log('list is ' + reservations.length + 'elements')
    reservations?.forEach((reservation) => {
        console.log(reservation)
        reservationsList.push (
            <li>
                <Reservation reservation={reservation} onDelete={deleteSomething}/>
            </li>
        )
    })

    if (reservationsList.length === 0) {
        return EmptyReservationsPage()
    }

    return (
        <div className="reservation-list">
            <ul>
                {reservationsList}
            </ul>
        </div>
    )
}

function UserReservations() {
    const page_name = "Reservations"

    return (
        <ContentWrapper page_name = {page_name}>
            <ReservationsList/>
        </ContentWrapper>
    )
}

export default UserReservations;