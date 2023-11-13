import {NavLink, useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {toAPITime, fromAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
// import Form from '../components/Form'

const CurrentReservationContext = createContext()
const Start_day_time = "09:00"
const Finish_day_time = "23:59"

function GetRoomInfo() {
    const location = useLocation();
    const navigate = useNavigate()

    const id = location.pathname.slice(6, location.pathname.length)

    let {triggerFetch, result, loading, statusCode} = useSomeAPI('/api/v0/rooms/' + id)
        //eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => triggerFetch(), [])

        // doRequest()
        if (statusCode === 404) {
                navigate('/pagenotfound', {replace: true})

        }
    if (statusCode !== 200 || loading || result == null) {
        return {
            id: id
        }
    }

    // const res = getRoomInfo(id)

    return result
}

function GetReservations(room_id, date) {
    console.log("GetReservations invoked with date = " + date)
    console.log("used some api with /api/v0/rooms/" + room_id + "/reservations")
    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms/' + room_id + '/reservations')
        //eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => triggerFetch(), [])
        console.log("after useSomeAPI")

        if (statusCode === 200 && finished && result != null) {
            return {
                    reservations: result.filter((reservation) => (fromAPITime(reservation.from).date === date)),
                    triggerGetReservations: triggerFetch
            }
        }

    return {
            reservations: null,
            triggerGetReservations: triggerFetch
    }
}

function useBookRoom(room_id, user_id, date, from, to) {
    const reservation = {
        from: toAPITime(date, from),
        until: toAPITime(date, to),
        room_id: room_id
    }

    let {triggerFetch, result, loading, statusCode, finished} = useSomeAPI('/api/v0/reserve', reservation, "POST")

    return {triggerFetch, result, loading, statusCode, finished}
}


function BookingForm({room_id, triggerGetReservations}) {

    const {from, setFrom, until, setUntil, date} = useContext(CurrentReservationContext)

    const {currentUser} = useContext(CurrentUserContext)
    const {triggerFetch, result, statusCode, finished} = useBookRoom(room_id, currentUser?.user_id, date, from, until);

    useEffect(() => {
        if (finished) {
                if (statusCode === 400) alert("Error: " + result)
                else if (statusCode === 409) alert("Impossible to reserve: at this time classroom already reserved")
                else if (statusCode === 201) alert("Reservation succeeded!");
                else alert("Status Code: " + statusCode)

                triggerGetReservations()
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    if (currentUser === null) {
        return (
            <ContentWrapper page_name='Reservation'>
                <label className='not-authorized-label'>
                    You are not authorized. To gain ability to reserve, please,
                </label>
                <NavLink className='not-authorized-link' to='/sign-in'>
                    log into the system.
                </NavLink>
            </ContentWrapper>
        )
    }

    function getTimeByMinutes(minutes) {
        const hour = Math.floor(minutes / 60)
        const minute = minutes % 60
        const hourString = (hour < 10 ? "0" : "") + hour.toString()
        const minuteString = (minute < 10 ? "0" : "") + minute.toString()
        return hourString + ":" + minuteString
    }

    function getMinutesByTime(time) {
        const hour = parseInt(time.slice(0, 2))
        const minutes = parseInt(time.slice(3, 5))
        return hour * 60 + minutes
    }

    const HandleSubmit = (e) => {
        e.preventDefault();

        if (getMinutesByTime(from) <= getMinutesByTime(until)) triggerFetch()
        triggerGetReservations()
    };

    const onFromChange = (e) => {
        let value = e.target.value.toString()

        // let valueMinutes = getMinutesByTime(value)
        // const minMinutes = getMinutesByTime(Start_day_time)
        // const maxMinutes = getMinutesByTime(Finish_day_time)
        // const untilMinutes = getMinutesByTime(until)
        //
        // valueMinutes = Math.min(valueMinutes, untilMinutes)
        // valueMinutes = Math.min(valueMinutes, maxMinutes)
        //
        // value = getTimeByMinutes(valueMinutes)
        setFrom(value)
    }

    const onUntilChange = (e) => {
        let value = e.target.value

        setUntil(value)
    }

    return (
        <ContentWrapper page_name='Reservation'>
            <form className="form-wrapper" onSubmit={HandleSubmit}>
                <div className="form-field">
                    <label className="form-label">
                        From
                    </label>
                    <input className="form-input" type="time" value={from} onChange={onFromChange}>

                    </input>
                </div>
                <div className="form-field">
                    <label className="form-label">
                        Until
                    </label>
                    <input className="form-input" type="time" value={until} onChange={onUntilChange}>

                    </input>
                </div>
                <input className="form-submit" type="submit" value="Reserve"></input>
            </form>
        </ContentWrapper>
    )
}

function Reservation ({reservation, is_current_reservation=false}) {

    let {triggerFetch, result} = useSomeAPI('/api/v0/users/' + reservation.user_id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [reservation])

    var reservedUsername = result?.username

    if (reservedUsername == null) {
        reservedUsername = reservation.user_id
    }

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

    var reservation_class_name = "reservation-wrapper"
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

function ReservationsList({reservations}) {
    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {from, until, date} = useContext(CurrentReservationContext)

    if (reservations == null) return (
        <label className='reservations-not-found-label'>
            Не удалось получить список бронирований для этого кабинета.
        </label>
    )

    console.log("reservations: " + reservations)


    const reservationsList = []
    reservations.forEach((reservation) => {
            reservationsList.push (
                // <li>
                    <Reservation reservation={reservation}/>
                // </li>
            )
        })

    if (isAuthorized) {
        const current_reservation = {
            from: toAPITime(date, from),
            until: toAPITime(date, until),
            user_id: user_id
        }
        reservationsList.push(<Reservation reservation={current_reservation} is_current_reservation={true}></Reservation>)
    }


    return (
            <div className="reservation-list-wrapper">
                    <div className="reservation-list-background"/>
                    {reservationsList}
            </div>
    )
}

function dateFormat(date, format = "yyyy-mm-dd") {
    var mlz = ""
    if (date.getMonth() + 1 < 10) mlz = "0"
    var dlz = ""
    if (date.getDate() < 10) dlz = "0"
    const map = {
        mm: mlz + (date.getMonth() + 1),
        dd: dlz + date.getDate(),
        yyyy: date.getFullYear(),
        // yy: date.getFullYear().toString().slice(-2)
    }

    return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
}

function getTodayDate(format = "yyyy-mm-dd") {
    const date = new Date()

    return dateFormat(date, format)
}

function updateDate(date, diff) {
    const new_date = new Date(date)
    new_date.setDate(new_date.getDate() + diff)
    const tmp = dateFormat(new_date)
    console.log(tmp)
    return tmp
}

function RoomDate({date, setDate}) {

    return (
        <div className="form-field">
            <div className="room-date">
                <div className="room-date-label">
                    <label className="form-label">
                        Date
                    </label>
                </div>
                <div className="room-date-value">
                    <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="room-date-buttons">
                    <div className="room-date-button-wrapper">
                        <input className="room-date-button" type="button" value="◄" onClick={() => setDate(updateDate(date, -1))}/>
                    </div>
                    <div className="room-date-button-wrapper">
                        <input className="room-date-button" type="button" value="►" onClick={() => setDate(updateDate(date, +1))}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Room() {
    const date_string = getTodayDate()
    const [date, setDate] = React.useState(date_string)
    const [from, setFrom] = React.useState("09:30")
    const [until, setUntil] = React.useState("11:05")
    const room_info = GetRoomInfo()
    const {reservations, triggerGetReservations} = GetReservations(room_info.id, date)

    console.log(reservations)

    const page_name = "Classroom: " + room_info.name

    return (
        <ContentWrapper page_name={page_name}>
        <CurrentReservationContext.Provider value={{date, setDate, from, setFrom, until, setUntil}}>
            <div className="room-wrapper">
                <div className='room-info'>
                    <div className='room-description'>{room_info.description}</div>
                     <div className='room-date'>
                        <RoomDate date={date} setDate={setDate}/>
                    </div>
                    <div className='reservations-info'>
                        <div>
                            <div className='reservations-label'>Reservations on {date}:</div>
                        </div>
                        <ReservationsList reservations={reservations}></ReservationsList>
                    </div>
                </div>
                <div className='room-booking-form'>
                    <BookingForm room_id={room_info.id} date={date} triggerGetReservations={triggerGetReservations}/>
                </div>
            </div>
        </CurrentReservationContext.Provider>
    </ContentWrapper>
    );
}

export default Room;
