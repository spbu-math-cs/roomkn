import './UserReservation.css';

import {NavLink} from 'react-router-dom'

import ContentWrapper from '../components/Content';
import React, {useContext, useEffect, useState} from 'react';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {fromAPITime} from "../api/API";


function Reservation({reservation, onDelete}) {

    let [roomName, setRoomName] = useState(null)

    console.log("reservation: " + reservation)

    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)

    const room_id = reservation.room_id

    const getRoomQueryResult = useSomeAPI('/api/v0/rooms/' + room_id, null, 'GET', getRoomCallback)

    let getRoomTriggerFetch = getRoomQueryResult.triggerFetch

    let {triggerFetch: deleteTriggerFetch} = useSomeAPI('/api/v0/reservations/' + reservation.id, null, 'DELETE', deleteCallback)


    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => getRoomTriggerFetch(), [])

    function deleteCallback(result, statusCode) {
        if (statusCode === 200) {
            alert('Удалено!')
            onDelete()
        }
    }

    // useEffect(() => {
    //     if (deleteFetchFlag === 0 || !deleteFinished) return
    //     onDelete()
    //     console.log("deleteFetchFlag: " + deleteFetchFlag)
    //     if (getRoomStatusCode === 200) {
    //         alert("Удалено!")
    //     }
    //     else alert("Error: " + deleteStatusCode)
    //     //eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [deleteFetchFlag, deleteFinished]);

    const deleteSubmit = (e) => {
        e.preventDefault();

        deleteTriggerFetch()
    };

    function getRoomCallback(result, statusCode) {
        if (statusCode === 200) {
            setRoomName(result.name)
        }
    }

    if (roomName === null) {
        return <tr/>
    }

    const link = "/room/" + room_id

    return (
        <tr>
            <td>
                <label className='reservation-info-label'>
                    Комната <NavLink to = {link}>{roomName} </NavLink>;
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

function useReservationsList(user_id) {

    let [reservations, setReservations] = useState([])

    let {triggerFetch} =
        useSomeAPI('/api/v0/reservations/by-user/' + user_id, null, 'GET', listCallback)

    
    function listCallback(result, statusCode) {
        if (statusCode === 200) {
            setReservations(result)
        }
    }

    useEffect(() => {
        triggerFetch()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user_id])


    return {
        reservations: reservations,
        triggerFetch: triggerFetch
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