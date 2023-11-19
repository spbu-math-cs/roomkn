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
    let setDeleteFinished = deleteReturned.setFinished
    let deleteStatusCode = deleteReturned.statusCode


    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const deleteSubmit = (e) => {
        e.preventDefault();

        deleteTriggerFetch()
    };

    useEffect(() => {
        if (deleteFinished) {
            onDelete()
            setDeleteFinished(false)
            console.log("")
            if (statusCode === 200) {
                alert("Удалено!")
            }
            else alert("Error: " + deleteStatusCode)
        }
    }, [deleteFinished]);


    if (statusCode === 200 && result != null && finished) {
        const room_name = result.name
        return (
        <tr>
            <td>
                <label className='reservation-info-label'>
                    Комната {room_name}; занята на {from_obj.date} с {from_obj.time} по {until_obj.time}
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

function useDeleteReservation(reservationId) {
    let {triggerFetch, finished, setFinished, statusCode} = useSomeAPI('/api/v0/reservations/' + reservationId, null, 'DELETE')
    return {triggerFetch, finished, setFinished, statusCode}
}
function useReservationsList(user_id) {
    let {triggerFetch, result, finished, statusCode, failed} = useSomeAPI('/api/v0/reservations/by-user/' + user_id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        triggerFetch()
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

    function deleteSomething() {
        console.log("deletedCount increased")
        triggerFetch()
    }

    const reservationsList = []
    console.log('list is ' + reservations.length + 'elements')
    reservations?.forEach((reservation) => {
        console.log(reservation)
        reservationsList.push (
            <Reservation reservation={reservation} onDelete={deleteSomething}/>
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