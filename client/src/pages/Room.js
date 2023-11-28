import {NavLink, useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {fromAPITime, toAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {Box, Button, Slider, Stack, Typography} from "@mui/material";

const CurrentReservationContext = createContext()
const Start_day_time = "09:00"
const Finish_day_time = "23:59"

function GetRoomInfo() {
    // TODO
    const location = useLocation()
    const navigate = useNavigate()

    const id = location.pathname.slice(6, location.pathname.length)

    let {triggerFetch, result, loading, statusCode} = useSomeAPI('/api/v0/rooms/' + id, null, 'GET', roomInfoCallback)
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    function roomInfoCallback(result, statusCode) {

    }

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

    let {triggerFetch} = useSomeAPI('/api/v0/rooms/' + room_id + '/reservations', null, 'GET', reservationsCallback)

    let [reservs, setReservs] = useState({
        reservations: null,
        triggerGetReservations: triggerFetch
    })

    console.log("GetReservations invoked with date = " + date)
    console.log("used some api with /api/v0/rooms/" + room_id + "/reservations")
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    function reservationsCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setReservs({
                reservations: result.filter((reservation) => (fromAPITime(reservation.from).date === date)),
                triggerGetReservations: triggerFetch
            })
        } else {
            setReservs({
                reservations: null,
                triggerGetReservations: triggerFetch
            })
        }
    }

    return reservs
}

function parseTimeMinutes(timeStr) {
    return Date.parse(`1970-01-01T${timeStr}Z`) / 60000
}

function makeTimeMinutes(minutes) {
    let h = (~~(minutes / 60)).toString().padStart(2, "0")
    let m = (minutes % 60).toString().padStart(2, "0")

    return h + ":" + m
}

const timeMarks = [...Array(25).keys()].map((_, idx, __) => {
    return {
        value: idx * 60,
        label: idx.toString().padStart(2, "0") + ":00"
    }
})

function BookingForm({room_id, triggerGetReservations}) {

    const {date, from, setFrom, until, setUntil} = useContext(CurrentReservationContext)

    const {currentUser} = useContext(CurrentUserContext)

    const reservation = {
        from: toAPITime(date, from),
        until: toAPITime(date, until),
        room_id: room_id
    }

    let {triggerFetch} = useSomeAPI('/api/v0/reserve', reservation, "POST", bookingCallback)


    function bookingCallback(result, statusCode) {
        if (statusCode === 400) alert("Error: " + result)
        else if (statusCode === 409) alert("Impossible to reserve: at this time classroom already reserved")
        else if (statusCode === 201) alert("Reservation succeeded!");
        else alert("Status Code: " + statusCode)

        triggerGetReservations()
    }

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

    return (
        <ContentWrapper page_name='Reservation'>
            <Typography fontSize="18pt">
                <Stack spacing={1}>
                    <Box sx={{paddingRight: "10pt", paddingLeft: "10pt"}}>
                        <Slider
                            track={false}
                            step={15}
                            min={0}
                            max={24 * 60}
                            value={[parseTimeMinutes(from), parseTimeMinutes(until)]}
                            onChange={(e) => {
                                setFrom(makeTimeMinutes(e.target.value[0]));
                                setUntil(makeTimeMinutes(e.target.value[1]));
                            }}
                            valueLabelDisplay="on"
                            getAriaVal  ueText={makeTimeMinutes}
                            valueLabelFormat={makeTimeMinutes}
                            marks={timeMarks}
                        />
                    </Box>
                    <Button color="secondary" variant="contained" onClick={HandleSubmit}
                            sx={{width: "100pt"}}>Reserve</Button>
                </Stack>
            </Typography>
        </ContentWrapper>
    )
}

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
        reservationsList.push(
            // <li>
            <Reservation reservation={reservation}/>
            // </li>
        )
    })

    if (isAuthorized && currentUser != null) {
        const current_reservation = {
            from: toAPITime(date, from),
            until: toAPITime(date, until),
            user_id: currentUser?.user_id
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
                    <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                </div>
                <div className="room-date-buttons">
                    <div className="room-date-button-wrapper">
                        <input className="room-date-button" type="button" value="◄"
                               onClick={() => setDate(updateDate(date, -1))}/>
                    </div>
                    <div className="room-date-button-wrapper">
                        <input className="room-date-button" type="button" value="►"
                               onClick={() => setDate(updateDate(date, +1))}/>
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
        <CurrentReservationContext.Provider value={{date, setDate, from, setFrom, until, setUntil}}>
            <ContentWrapper page_name={page_name}>
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
                </div>
            </ContentWrapper>
            <BookingForm room_id={room_info.id} date={date} triggerGetReservations={triggerGetReservations}/>
        </CurrentReservationContext.Provider>
    );
}

export default Room;
