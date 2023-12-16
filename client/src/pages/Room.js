import {NavLink, useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {fromAPITime, toAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {Box, Button, Slider, Stack, Typography} from "@mui/material";
import {SnackbarContext} from '../components/SnackbarAlert'
import TimelineWithUsers from "../components/Timeline";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";

const CurrentReservationContext = createContext()

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

    let {triggerFetch} = useSomeAPI('/api/v0/rooms/' + room_id + '/reservations', null, 'GET', ReservationsCallback)

    let [reservs, setReservs] = useState({
        reservations: null,
        triggerGetReservations: triggerFetch
    })

    console.log("GetReservations invoked with date = " + date)
    console.log("used some api with /api/v0/rooms/" + room_id + "/reservations")

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [date])


    function ReservationsCallback(result, statusCode) {
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

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function bookingCallback(result, statusCode) {
        if (statusCode === 400) setNewMessageSnackbar("Error: " + result)
        else if (statusCode === 409) setNewMessageSnackbar("Impossible to reserve: at this time classroom already reserved")
        else if (statusCode === 201) setNewMessageSnackbar("Reservation succeeded!")
        else setNewMessageSnackbar("Status Code: " + statusCode)

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
    };

    return (
        <ContentWrapper page_name='Reservation'>
            <Typography fontSize="18pt">
                <Stack spacing={1}>
                    <Box sx={{paddingRight: "10pt", paddingLeft: "10pt", display: { xs: 'none', md: 'flex' }}} >
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
                    <Box sx={{paddingRight: "10pt", paddingLeft: "10pt", display: { xs: 'flex', md: 'none' }}} >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="From"
                                value={dayjs(parseTimeMinutes(from))}
                                onChange={(newValue) => {
                                    console.log(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                                    setFrom(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                                }}
                                format="HH:mm"
                                sx={{mr: 1}}
                            />
                            <TimePicker
                                label="Until"
                                value={dayjs(parseTimeMinutes(until))}
                                onChange={(newValue) => {
                                    console.log(newValue.hour() * 60 + newValue.minute())
                                    setUntil(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                                }}
                                format="HH:mm"
                            />
                        </LocalizationProvider>
                    </Box>
                    <Button color="secondary"
                            variant="contained"
                            onClick={HandleSubmit}
                            disabled={getMinutesByTime(from) >= getMinutesByTime(until)}
                            sx={{width: "100pt"}}>
                        Reserve
                    </Button>
                </Stack>
            </Typography>
        </ContentWrapper>
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
                <div className="room-date-value">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker className="form-input" type="date" value={dayjs(date)}
                                    onChange={(v) => {
                                        setDate(dateFormat(v.toDate()));
                                    }}
                                    label="Date"
                                    format="DD.MM.YYYY"
                        />
                    </LocalizationProvider>
                </div>
                {/*<div className="room-date-buttons">*/}
                {/*    <div className="room-date-button-wrapper">*/}
                {/*        <input className="room-date-button" type="button" value="◄"*/}
                {/*               onClick={() => setDate(updateDate(date, -1))}/>*/}
                {/*    </div>*/}
                {/*    <div className="room-date-button-wrapper">*/}
                {/*        <input className="room-date-button" type="button" value="►"*/}
                {/*               onClick={() => setDate(updateDate(date, +1))}/>*/}
                {/*    </div>*/}
                {/*</div>*/}
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

    let currentReservation = null

    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    if (currentUser != null && isAuthorized) {
        currentReservation = {
            from: toAPITime(date, from),
            until: toAPITime(date, until),
            user_id: currentUser?.user_id
        }
    }

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
                                <div className='reservations-label'>Reservations:</div>
                            </div>
                            <TimelineWithUsers reservations={reservations} currentReservation={currentReservation}/>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
            <BookingForm room_id={room_info.id} date={date} triggerGetReservations={triggerGetReservations}/>
        </CurrentReservationContext.Provider>
    )
}

export default Room;