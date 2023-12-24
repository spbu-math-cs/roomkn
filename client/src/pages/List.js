import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect, useState} from "react";
import {
    Box, Button,
    ListItemButton,
    Stack, Typography,
} from "@mui/material";
import {fromAPITime, toAPITime} from "../api/API";
import Timeline from "../components/TimelineForRoomList";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";

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

function GetReservationsInSegment(room_id, dateFrom, dateUntil) {

    let {triggerFetch, finished} = useSomeAPI('/api/v0/rooms/' + room_id + '/reservations', null, 'GET', ReservationsCallback)

    let [reservations, setReservations] = useState(null)

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [dateFrom, dateUntil])

    function ReservationsCallback(result, statusCode) {
        console.log("all reservations for room " + room_id + " are (status code: " + statusCode + " ):")
        if (statusCode === 200 && result != null) {
            setReservations(
                result.filter((reservation) => (
                    fromAPITime(reservation.from).date <= dateUntil &&
                    fromAPITime(reservation.until).date >= dateFrom
                )))
        } else {
            setReservations(null)
        }
    }

    return {
        reservations: reservations,
        triggerGetReservations: triggerFetch,
        loading_finished: finished,
    }
}

function updateDate(date, diff) {
    const new_date = new Date(date)
    new_date.setDate(new_date.getDate() + diff)
    return new_date
}

function TimelineForRoom({room, fromDate, untilDate, show_time_labels}) {
    const {reservations, loading_finished} = GetReservationsInSegment(room.id, fromDate, untilDate)

    let realFromDate = new Date(toAPITime(fromDate, "00:00"))
    // realFromDate.setHours(0, 0)

    let realUntilDate = new Date(toAPITime(untilDate, "00:00"))
    // realUntilDate.setHours(0, 0)
    realUntilDate = updateDate(realUntilDate, +1)

    return (
        <Timeline
            reservations={reservations}
            fromTimelineDate={realFromDate}
            untilTimelineDate={realUntilDate}
            show_time_labels={show_time_labels}
            height={50}
            loading_finished={loading_finished}
        />
    )
}

function DateSelect({from, setFromDate, until, setUntilDate}) {

    function setTodayDay() {
        const date = new Date()
        const today = dateFormat(date)
        setFromDate(today)
        setUntilDate(today)
    }

    function setTomorrowDay() {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        const tomorrow = dateFormat(date)
        setFromDate(tomorrow)
        setUntilDate(tomorrow)
    }

    function setThisWeekDate() {
        const dateFrom = new Date()
        const dateUntil = new Date()
        const fromDelta = -dateFrom.getDay() + 1, untilDelta = 7 - dateUntil.getDay()
        dateFrom.setDate(dateFrom.getDate() + fromDelta)
        dateUntil.setDate(dateUntil.getDate() + untilDelta)
        setFromDate(dateFormat(dateFrom))
        setUntilDate(dateFormat(dateUntil))
    }

    function setNextWeekDate() {
        const dateFrom = new Date()
        const dateUntil = new Date()
        const fromDelta = -dateFrom.getDay() + 1 + 7, untilDelta = 7 - dateUntil.getDay() + 7
        dateFrom.setDate(dateFrom.getDate() + fromDelta)
        dateUntil.setDate(dateUntil.getDate() + untilDelta)
        setFromDate(dateFormat(dateFrom))
        setUntilDate(dateFormat(dateUntil))
    }

    const datePickers = (
        <Box>
            <DatePicker id="date" label="From" type="date" value={dayjs(from)}
                        onChange={(v) => {
                            setFromDate(dateFormat(v.toDate()));
                        }}
                        format="DD.MM.YYYY"
                        sx={{mb: 1}}
            />
            <DatePicker id="date" label="Until" type="date" value={dayjs(until)}
                        onChange={(v) => {
                            setUntilDate(dateFormat(v.toDate()));
                        }}
                        format="DD.MM.YYYY"
            />
        </Box>
    )

    const button_sx = {
        paddingTop: "16.5px",
        paddingBottom: "16.5px",
        fontSize: 12,
    }

    const buttons = (
        <Box>
            <Button variant="text" onClick={setTodayDay} sx={button_sx}>Today</Button>
            <Button variant="text" onClick={setTomorrowDay} sx={button_sx}>Tomorrow</Button>
            <Button variant="text" onClick={setThisWeekDate} sx={button_sx}>This Week</Button>
            <Button variant="text" onClick={setNextWeekDate} sx={button_sx}>Next Week</Button>
        </Box>
    )

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={1} className="room-list-time" sx={{display: {xs: 'none', lg: 'flex'}}}>
                {datePickers}
                {buttons}
            </Stack>
            <Stack spacing={1} className="room-list-time" sx={{display: {xs: 'flex', lg: 'none'}}}>
                {datePickers}
                {buttons}
            </Stack>
        </LocalizationProvider>
    )
}

function RoomRow({room, from, until, is_first_room_row}) {

    const link = "/room/" + String(room.id)

    return (
            <ListItemButton href={link} data-test-id={"link-" + room.id}>
                <Stack direction="row" alignItems="center" width="100%" spacing={5}>
                    <Box fontSize={20} sx={{width: 5/100}}>
                        <Typography align={"right"}>
                            {room.name}
                        </Typography>
                    </Box>

                    <TimelineForRoom room={room} fromDate={from} untilDate={until} show_time_labels={is_first_room_row}/>
                </Stack>
            </ListItemButton>

    );
}

function RoomList() {

    let [draw_list, setDrawList] = useState([])

    const today = getTodayDate()

    const [from, setFrom] = useState(today)
    const [until, setUntil] = useState(today)

    const [roomList, setRoomList] = useState([])

    function my_callback(result, statusCode) {
        console.log("result: " + result)
        console.log("statusCode:"  + statusCode)
        if (statusCode === 200 && result != null) {
            setRoomList(result);
            console.log(result)
        }
    }

    let {triggerFetch} = useSomeAPI('/api/v0/rooms', null, 'GET', my_callback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    useEffect(() => {
        let is_first_room_row = true
        const new_draw_list = []
        roomList.forEach((room) => {
            new_draw_list.push(<RoomRow room={room} from={from} until={until} is_first_room_row={is_first_room_row}/>)
            is_first_room_row = false
        })
        setDrawList(new_draw_list)
    }, [from, until, roomList]);

    return (
        <ContentWrapper page_name="Classrooms">
            <Stack direction = "column">
                <DateSelect from = {from} setFromDate={setFrom} until = {until} setUntilDate={setUntil}/>
                {draw_list}
            </Stack>

        </ContentWrapper>
    );
}


export default RoomList;