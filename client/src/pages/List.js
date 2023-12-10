import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect, useState} from "react";
import {
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    TextField,
    useTheme
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

function TimelineForRoom({room, fromDate, untilDate}) {
    const {reservations} = GetReservationsInSegment(room.id, fromDate, untilDate)

    console.log("reservations for room" + room.name + " " + room.id + "are:")
    console.log(reservations)

    let realFromDate = new Date(fromDate)
    realFromDate.setHours(9, 0)

    let realUntilDate = new Date(untilDate)
    realUntilDate.setHours(23, 59)

    return (
        <TimelineForRoomList reservations = {reservations} fromTimelineDate={realFromDate} untilTimelineDate={realUntilDate}/>
    )
}

function RoomRow({room}) {

    const link = "/room/" + String(room.id)
    const theme = useTheme()
    const date = getTodayDate()

    const [fromDate, setFromDate] = useState(date)
    const [untilDate, setUntilDate] = useState(date)

    return (
        <ListItem>
            <Stack direction="column" alignItems="center" spacing={theme.spacing()}>
                <ListItemButton href={link} data-test-id={"link-" + room.id}>
                    <Stack direction="column" alignItems="center" spacing={theme.spacing()}>
                        <ListItemText primary={room.name} secondary={room.description}/>
                        <TimelineForRoom room={room} fromDate={fromDate} untilDate={untilDate}/>
                    </Stack>
                </ListItemButton>
                <Stack direction="row">
                    <TextField id="date" label="From" type="date" defaultValue={date} onChange={(e) => {setFromDate(e.target.value)}}/>
                    <TextField id="date" label="Until" type="date" defaultValue={date} onChange={(e) => {setUntilDate(e.target.value)}}/>
                </Stack>
            </Stack>
            <Divider/>
        </ListItem>
    );
}

function RoomList() {

    let [draw_list, setDrawList] = useState([])

    function my_callback(result, statusCode) {
        console.log("result: " + result)
        console.log("statusCode:"  + statusCode)
        if (statusCode === 200 && result != null) {
            console.log(result)
            const new_draw_list = []
            result.forEach((room) => {
                new_draw_list.push(<RoomRow room={room} key={room.id}/>)
            })
            setDrawList(new_draw_list)
        }
    }

    let {triggerFetch} = useSomeAPI('/api/v0/rooms', null, 'GET', my_callback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    return (
        <ContentWrapper page_name="Classrooms">
            <List>
                {draw_list}
            </List>
        </ContentWrapper>
    );
}


export default RoomList;