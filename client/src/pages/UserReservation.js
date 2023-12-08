import './UserReservation.css';

import {NavLink} from 'react-router-dom'

import ContentWrapper from '../components/Content';
import React, {useContext, useEffect} from 'react';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {fromAPITime} from "../api/API";

function useDeleteReservation(reservationId) {
    let {triggerFetch, statusCode, finished, fetchFlag} = useSomeAPI('/api/v0/reservations/' + reservationId, null, 'DELETE')
    return {triggerFetch, statusCode, finished, fetchFlag}
}

function Reservation({reservation, onDelete}) {
    console.log("reservation: " + reservation)

    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)

    const room_id = reservation.room_id

    const getRoomQueryResult = useSomeAPI('/api/v0/rooms/' + room_id)

    let getRoomTriggerFetch = getRoomQueryResult.triggerFetch
    let getRoomResult = getRoomQueryResult.result
    let getRoomFinished = getRoomQueryResult.finished
    let getRoomStatusCode = getRoomQueryResult.statusCode

    let deleteReturned = useDeleteReservation(reservation.id)

    let deleteTriggerFetch = deleteReturned.triggerFetch
    let deleteStatusCode = deleteReturned.statusCode
    let deleteFetchFlag = deleteReturned.fetchFlag
    let deleteFinished = deleteReturned.finished

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => getRoomTriggerFetch(), [])

    useEffect(() => {
        if (deleteFetchFlag === 0 || !deleteFinished) return
        onDelete()
        console.log("deleteFetchFlag: " + deleteFetchFlag)
        if (getRoomStatusCode === 200) {
            alert("Удалено!")
        }
        else alert("Error: " + deleteStatusCode)
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteFetchFlag, deleteFinished]);

    const deleteSubmit = (e) => {
        e.preventDefault();

        deleteTriggerFetch()
    };

    if (getRoomStatusCode === 200 && getRoomResult != null && getRoomFinished) {
        const room_name = getRoomResult.name
        const link = "/room/" + room_id
        return (    
        <tr>
            <td>
                <label className='reservation-info-label'>
                    Комната <NavLink to = {link}>{room_name} </NavLink>;
                    занята на {from_obj.date} с {from_obj.time} по {until_obj.time}
                </label>
            </td>
            <td>
                <button className='reservation-delete-button' onClick={deleteSubmit} >
                    Удалить резервацию
                </button>
            </td>
        </tr>
        )
    }
    return <tr/>
}
function useReservationsList(user_id) {
    let {triggerFetch, result, finished, statusCode, failed} =
        useSomeAPI('/api/v0/reservations/by-user/' + user_id)

    useEffect(() => {
        triggerFetch()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user_id])

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
function EmptyReservationsPage() {
    return (
        <div>
            You have no reservations
        </div>
    )
}
function ReservationsList() {
    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {triggerFetch, reservations} = useReservationsList(currentUser?.user_id)

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
    console.log('list is ' + reservations.length + 'elements')
    reservations?.forEach((reservation) => {
        console.log(reservation)
        reservationsList.push (
            <Reservation reservation={reservation} onDelete={triggerFetch}/>
        )
    })

    if (reservationsList.length === 0) {
        return EmptyReservationsPage()
    }

    return (
        <table className="reservation-list">
            <tbody>{reservationsList}</tbody>
        </table>
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