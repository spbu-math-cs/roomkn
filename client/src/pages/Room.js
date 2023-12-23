import {NavLink, useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {fromAPITime, toAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    Skeleton,
    Slider,
    Stack,
    Typography
} from "@mui/material";
import {SnackbarContext} from '../components/SnackbarAlert'
import Timeline from "../components/TimelineForRoomList";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import MenuItem from "@mui/material/MenuItem";

const CurrentReservationContext = createContext()

export function GetRoomInfo() {
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
            result: {
                id: id
            },
            triggerFetch
        }
    }

    // const res = getRoomInfo(id)

    return {result, triggerFetch}
}

export function GetReservations(room_id, date) {

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

function BookingForm({room_id, triggerGetReservations, min_res_time, max_res_time}) {

    const {date, from, setFrom, until, setUntil, isActive, setIsActive} = useContext(CurrentReservationContext)
    const [repeat, setRepeat] = useState("no-repeat")
    const [repeatUntil, setRepeatUntil] = useState(getTodayDate())

    const min_booking_time = parseTimeMinutes(min_res_time)
    const max_booking_time = parseTimeMinutes(max_res_time)

    const {currentUser} = useContext(CurrentUserContext)

    const defaultReservationList = [{
        from: toAPITime(date, from),
        until: toAPITime(date, until),
        room_id: room_id
    }]

    const [reservationList, setReservationList] = useState(
        defaultReservationList
    )

    function GetTriggerFetch(reservation) {
        const reservationDate = fromAPITime(reservation.from).date

        function callback(result, statusCode) {
            if (statusCode === 400) setNewMessageSnackbar("Reservation on date" + reservationDate + ": error: " + result)
            else if (statusCode === 409)
                setNewMessageSnackbar("Reservation on date" + reservationDate +
                    ":impossible to reserve(at this time classroom already reserved)")
            else if (statusCode === 201) setNewMessageSnackbar("Reservation on date" + reservationDate + ":reservation succeeded!")
            else setNewMessageSnackbar("Reservation on date" + reservationDate + ":status Code: " + statusCode)
        }

        let {triggerFetch} = useSomeAPI('/api/v0/reserve', reservation, "POST", callback)
        return triggerFetch
    }

    const triggerFetchList = reservationList.map((reservation) => GetTriggerFetch(reservation))

    const massTriggerFetch = () => {
        triggerFetchList.forEach((el) => el())
        triggerGetReservations()
    }

    function updateReservationsList() {
        if (repeat === "no-repeat") {
            setReservationList(defaultReservationList)
            return
        }

        function nextDay(date) {
            date.setDate(date.getDate() + 1)
            return date
        }
        function nextWeek(date) {
            date.setDate(date.getDate() + 7)
            return date
        }

        let changeDate = (repeat === "every-day" ? nextDay : nextWeek)

        console.log("start date: " + new Date() + "until date: " + new Date(repeatUntil))

        const untilDate = new Date(repeatUntil)

        const newReservationList = []
        for (let currDate = new Date(); currDate <= untilDate; currDate = new Date(changeDate(currDate))) {
            console.log("foreach date: " + currDate)
            newReservationList.push({
                from: toAPITime(currDate, from),
                until: toAPITime(currDate, until),
                room_id: room_id
            })
        }

        console.log("new reservation list: " + newReservationList)

        setReservationList(newReservationList)
    }

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

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

    const MassHandleSubmit = (e) => {
        e.preventDefault();

        console.log("massHandleSubmit repeat: " + repeat + " repeat until: " + repeatUntil)

        updateReservationsList()
        massTriggerFetch()
    }

    const is_reserve_disabled = (getMinutesByTime(from) >= getMinutesByTime(until)) || (date < getTodayDate())

    return (
        <ContentWrapper page_name='Reservation'>
            <Typography fontSize="18pt" sx={{display: isActive ? '' : 'none'}}>
                <Stack spacing={5}>
                    <Box sx={{paddingRight: 1, paddingLeft: 1, display: { xs: 'none', md: 'flex' }}} fullWidth>
                        <Slider
                            fullWidth
                            track={false}
                            step={5}
                            min={min_booking_time}
                            max={max_booking_time}
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
                    <Stack direction="row" spacing={1} sx={{paddingRight: "10pt", paddingLeft: "10pt"}} >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="From"
                                value={dayjs('1970-01-01 '+ from)}
                                onChange={(newValue) => {
                                    console.log(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                                    setFrom(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                                }}
                                format="HH:mm"
                                sx={{mr: 1, mb: 2}}
                            />
                            <TimePicker
                                label="Until"
                                value={dayjs('1970-01-01 '+ until)}
                                onChange={(newValue) => {
                                    console.log(newValue.hour() * 60 + newValue.minute())
                                    setUntil(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                                }}
                                format="HH:mm"
                            />
                        </LocalizationProvider>
                        <FormControl>
                            <InputLabel id="repeated-select-label">Repeat:</InputLabel>
                            <Select
                                label="Repeat:"
                                labelId="repeated-select-label"
                                value = {repeat}
                                onChange = {(e) => {setRepeat(e.target.value)}}
                            >
                                <MenuItem value = "no-repeat"> Do not repeat</MenuItem>
                                <MenuItem value = "every-day"> Every day</MenuItem>
                                <MenuItem value = "every-week"> Every week</MenuItem>
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                type="date" value={dayjs(repeatUntil)}
                                onChange={(v) => {setRepeatUntil(dateFormat(v.toDate()))}}
                                label="Repeat until:"
                                format="DD.MM.YYYY"
                            />
                        </LocalizationProvider>
                    </Stack>


                    <Stack direction="row" spacing={2}>
                        <Button color="secondary"
                                variant="contained"
                                onClick={MassHandleSubmit}
                                disabled={is_reserve_disabled}
                                sx={{width: "100pt"}}>
                            Reserve
                        </Button>
                        <Button color="secondary"
                                variant="outlined"
                                onClick={() => setIsActive(false)}
                                disabled={is_reserve_disabled}
                                sx={{width: "100pt"}}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Typography>
            <Box sx={{display: isActive ? 'none' : ''}}>
                <Button color="secondary"
                        variant="contained"
                        onClick={() => setIsActive(true)}
                        disabled={is_reserve_disabled}
                        sx={{width: "200pt"}}
                >
                    New reservation
                </Button>
            </Box>
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

export function getTodayDate(format = "yyyy-mm-dd") {
    const date = new Date()

    return dateFormat(date, format)
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
            </div>
        </div>
    )
}


function Room() {

    const min_res_time = "09:30";
    const max_res_time = "23:30"

    const date_string = getTodayDate()
    const [date, setDate] = React.useState(date_string)
    const [from, setFrom] = React.useState("09:30")
    const [until, setUntil] = React.useState("11:05")
    const [isActive, setIsActive] = React.useState(false)
    const {result: room_info} = GetRoomInfo()
    const {reservations, triggerGetReservations} = GetReservations(room_info.id, date)

    console.log(reservations)

    const room_name = room_info.name == null ? (<Skeleton/>) : room_info.name

    const page_name = (
        <Stack direction="row" spacing={2} alignItems="flex-end">
            <Box>Classroom:</Box>
            <Typography variant="h4">{room_name}</Typography>
        </Stack>
    )

    let currentReservation = null

    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    if (currentUser != null && isAuthorized && isActive) {
        currentReservation = {
            from: toAPITime(date, from),
            until: toAPITime(date, until),
            user_id: currentUser?.user_id
        }
    }

    const fromTimelineDate = new Date(toAPITime(date, min_res_time))
    const untilTimelineDate = new Date(toAPITime(date, max_res_time))

    console.log(fromTimelineDate, untilTimelineDate)

    return (
        <CurrentReservationContext.Provider value={{date, setDate, from, setFrom, until, setUntil, isActive, setIsActive}}>
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
                            <Box sx={{ml: 5, mr: 5}}>
                                <Timeline reservations={reservations}
                                          fromTimelineDate={fromTimelineDate}
                                          untilTimelineDate={untilTimelineDate}
                                          show_reservation_labels={true}
                                          show_time_labels={true}
                                          currentReservation={currentReservation}
                                          height={150}
                                />
                            </Box>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
            <Box sx={{display: isAuthorized ? '' : 'none'}}>
                <BookingForm
                    room_id={room_info.id}
                    date={date}
                    triggerGetReservations={() => {
                        triggerGetReservations()
                        console.log("trigger get reservations")
                    }}
                    min_res_time={min_res_time}
                    max_res_time={max_res_time}
                />
            </Box>

        </CurrentReservationContext.Provider>
    )
}

export default Room;