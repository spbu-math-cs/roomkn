import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect, useState} from "react";
import {
    Box,
    Grid,
    ListItemButton,
    Stack,
    TextField,
} from "@mui/material";
import {fromAPITime} from "../api/API";
import TimelineForRoomList from "../components/TimelineForRoomList";

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

    let {triggerFetch} = useSomeAPI('/api/v0/rooms/' + room_id + '/reservations', null, 'GET', ReservationsCallback)

    let [reservs, setReservs] = useState({
        reservations: null,
        triggerGetReservations: triggerFetch
    })

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [dateFrom, dateUntil])

    function ReservationsCallback(result, statusCode) {
        console.log("all reservations for room " + room_id + " are (status code: " + statusCode + " ):")
        if (statusCode === 200 && result != null) {
            setReservs({
                reservations: result.filter((reservation) => (
                    fromAPITime(reservation.from).date <= dateUntil &&
                    fromAPITime(reservation.until).date >= dateFrom
                )),
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

function updateDate(date, diff) {
    const new_date = new Date(date)
    new_date.setDate(new_date.getDate() + diff)
    return new_date
}

function TimelineForRoom({room, fromDate, untilDate}) {
    const {reservations} = GetReservationsInSegment(room.id, fromDate, untilDate)

    let realFromDate = new Date(fromDate)
    realFromDate.setHours(0, 0)

    let realUntilDate = new Date(untilDate)
    realUntilDate.setHours(0, 0)
    realUntilDate = updateDate(realUntilDate, +1)

    return (
        <TimelineForRoomList reservations = {reservations} fromTimelineDate={realFromDate} untilTimelineDate={realUntilDate}/>
    )
}

function DateSelect({setFromDate, setUntilDate}) {

    const date = getTodayDate()

    return (
        <Stack direction="row" spacing={1}>
            {/*<DateTimePicker>*/}

            {/*</DateTimePicker>*/}
            <TextField id="date" label="From" type="date" defaultValue={date} onChange={(e) => {setFromDate(e.target.value)}}/>
            <TextField id="date" label="Until" type="date" defaultValue={date} onChange={(e) => {setUntilDate(e.target.value)}}/>
        </Stack>
    )
}

function RoomRow({room, from, until}) {

    const link = "/room/" + String(room.id)

    //TODO: fix xs
    return (
        <Grid item xs = {100000}>
            <ListItemButton href={link} data-test-id={"link-" + room.id}>
            <Grid container item alignItems="center" xs = {100000}>
                <Grid item xs = {1}>
                    <Box fontSize={20}> {room.name} </Box>
                </Grid>
                <Grid item xs = {1}>
                    <TimelineForRoom room={room} fromDate={from} untilDate={until}/>
                </Grid>
            </Grid>
            </ListItemButton>
        </Grid>

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
        const new_draw_list = []
        roomList.forEach((room) => {
            new_draw_list.push(<RoomRow room={room} from={from} until={until}/>)
        })
        setDrawList(new_draw_list)
    }, [from, until, roomList]);

    return (
        <ContentWrapper page_name="Classrooms">
            <Stack direction = "column">
                <DateSelect setFromDate={setFrom} setUntilDate={setUntil}/>
                <Grid container>
                    {draw_list}
                </Grid>
            </Stack>

        </ContentWrapper>
    );
}


export default RoomList;