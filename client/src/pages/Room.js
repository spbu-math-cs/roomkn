import {NavLink, useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {fromAPITime, toAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import {
    Box,
    Button, Fab,
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
import EditIcon from '@mui/icons-material/Edit';

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

export function GetReservations(room_id, date, auto_update) {
    const params = new URLSearchParams()
    params.append("room_ids", [room_id])
    params.append("from", toAPITime(date, "00:00"))
    params.append("until", toAPITime(date, "23:59"))

    let {triggerFetch, finished} = useSomeAPI('/api/v0/reservations?' + params.toString(), null, 'GET', ReservationsCallback)

    let [reservations, setReservations] = useState(null)

    console.log("GetReservations invoked with date = " + date)
    console.log("used some api with /api/v0/rooms/" + room_id + "/reservations")

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (auto_update)
            triggerFetch()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])


    function ReservationsCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setReservations(result)
        } else {
            setReservations(null)
        }
    }

    return {
        reservations,
        triggerGetReservations: triggerFetch,
        loading_finished: finished,
    }
}

export function parseTimeMinutes(timeStr) {
    return Date.parse(`1970-01-01T${timeStr}Z`) / 60000
}

export function makeTimeMinutes(minutes) {
    let h = (~~(minutes / 60)).toString().padStart(2, "0")
    let m = (minutes % 60).toString().padStart(2, "0")

    return h + ":" + m
}

export const timeMarks = [...Array(25).keys()].map((_, idx, __) => {
    return {
        value: idx * 60,
        label: idx.toString().padStart(2, "0") + ":00"
    }
})

export function BookingFormDatePickers({from, setFrom, until, setUntil}) {
    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                    label="From"
                    value={dayjs('1970-01-01 '+ from)}
                    onChange={(newValue) => {
                        console.log(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                        setFrom(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                    }}
                    format="HH:mm"
                    sx={{ margin: 1}}
                />
                <TimePicker
                    label="Until"
                    value={dayjs('1970-01-01 '+ until)}
                    onChange={(newValue) => {
                        console.log(newValue.hour() * 60 + newValue.minute())
                        setUntil(makeTimeMinutes(newValue.hour() * 60 + newValue.minute()))
                    }}
                    format="HH:mm"
                    sx={{ margin: 1}}
                />
            </LocalizationProvider>
        </Box>
    )
}

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

    function reservationsCallback(result, statusCode) {
        if (statusCode === 201) {
            console.log("result: ", result?.success, "result: ", result)

            result.success.forEach((reservation) => {
                setNewMessageSnackbar("Successfully reserved on date " + fromAPITime(reservation.from).date)
            })

            result.failure.forEach((reservation) => {
                setNewMessageSnackbar("Reservation on " + fromAPITime(reservation.request.from).date + " failed: " + reservation.message)
            })
        } else setNewMessageSnackbar("Status code: " + statusCode)
        triggerGetReservations()
    }

    const {triggerFetch} = useSomeAPI('/api/v0/reserve/multiple', reservationList, "POST", reservationsCallback)

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

        const untilDate = new Date(repeatUntil)

        function getStartDate() {
            const date = new Date()
            date.setHours(0, 0)
            return date
        }

        const newReservationList = []
        for (let currDate = getStartDate(); currDate <= untilDate; currDate = new Date(changeDate(currDate))) {
            console.log("foreach date: " + currDate)
            newReservationList.push({
                from: toAPITime(dateFormat(currDate), from),
                until: toAPITime(dateFormat(currDate), until),
                room_id: room_id
            })
        }
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
        triggerFetch()
    }

    const is_reserve_disabled = (getMinutesByTime(from) >= getMinutesByTime(until)) || (date < getTodayDate())

    const timePickers = <BookingFormDatePickers from={from} setFrom={setFrom} until={until} setUntil={setUntil}/>

    const repeatChoose = (
        <Box>
            <FormControl sx={{ margin: 1}}>
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
                    sx={{margin: 1, display: repeat === 'no-repeat' ? 'none' : ''}}

                />
            </LocalizationProvider>
        </Box>
    )

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
                    <Stack direction="row" spacing={1} sx={{paddingRight: "10pt", paddingLeft: "10pt", display: {xs: 'none', lg: 'flex'}}} >
                        {timePickers}
                        {repeatChoose}
                    </Stack>
                    <Stack direction="column" spacing={1} sx={{paddingRight: "10pt", paddingLeft: "10pt", display: {xs: 'flex', lg: 'none'}}} >
                        {timePickers}
                        {repeatChoose}
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
    const {reservations, triggerGetReservations, loading_finished} = GetReservations(room_info.id, date, true)

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
                                          // show_reservation_labels={true}
                                          show_time_labels={true}
                                          currentReservation={currentReservation}
                                          height={75}
                                          loading_finished={loading_finished}
                                />
                            </Box>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
            <Box sx={{display: isAuthorized ? {xs: isActive ? '' : 'none', md: 'block'} : 'none'}}>
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
            <Fab
                color="secondary"
                variant="extended"
                onClick={() => setIsActive(true)}
                sx={{
                    position: 'absolute',
                    bottom: 76,
                    right: 36,
                    display: isAuthorized ? {xs: isActive ? 'none' : '', md: 'none'} : 'none',
                }}
            >
                <EditIcon sx={{mr: 1}}/>
                New Reservation
            </Fab>

        </CurrentReservationContext.Provider>
    )
}

export default Room;