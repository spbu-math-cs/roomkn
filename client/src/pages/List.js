import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect, useState} from "react";
import {
    Box,
    ListItemButton,
    Stack, Typography, Skeleton,
} from "@mui/material";
import {fromAPITime} from "../api/API";
import TimelineForRoomList from "../components/TimelineForRoomList";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PaginatedList from "../components/PaginatedList";

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

function TimelineForRoom({room, fromDate, untilDate, is_first_timeline}) {
    const {reservations} = GetReservationsInSegment(room.id, fromDate, untilDate)

    let realFromDate = new Date(fromDate)
    realFromDate.setHours(0, 0)

    let realUntilDate = new Date(untilDate)
    realUntilDate.setHours(0, 0)
    realUntilDate = updateDate(realUntilDate, +1)

    return (
        <TimelineForRoomList reservations = {reservations} fromTimelineDate={realFromDate} untilTimelineDate={realUntilDate} is_first_timeline={is_first_timeline}/>
    )
}

function DateSelect({setFromDate, setUntilDate}) {

    const date = getTodayDate()

    return (
        <Stack direction="row" spacing={1} className="room-list-time">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="date" label="From" type="date" defaultValue={dayjs(date)}
                            onChange={(v) => {
                                setFromDate(dateFormat(v.toDate()));
                            }}
                            format="DD.MM.YYYY"
                />
                <DatePicker id="date" label="Until" type="date" defaultValue={dayjs(date)}
                            onChange={(v) => {
                                setUntilDate(dateFormat(v.toDate()));
                            }}
                            format="DD.MM.YYYY"
                />
            </LocalizationProvider>
        </Stack>
    )
}

function TimelineSkeleton() {
    return (
        <Skeleton variant="rectangular" sx={{width: 100/100, height:50, fontSize: 20}}/>
    )
}

function RoomRowSkeleton() {
    return (
        <ListItemButton data-test-id={"link-"}>
            <Stack direction="row" alignItems="center" width="100%" spacing={5}>
                <Skeleton sx={{width: 5/100, fontSize: 20}} />
                <TimelineSkeleton/>
            </Stack>
        </ListItemButton>
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

                    <TimelineForRoom room={room} fromDate={from} untilDate={until} is_first_timeline={is_first_room_row}/>
                </Stack>
            </ListItemButton>

    );
}

function RoomList() {

    const today = getTodayDate()

    const [from, setFrom] = useState(today)
    const [until, setUntil] = useState(today)

    function resultHandler(result, statusCode, elementsOnPage) {
        let is_first_room_row = true
        const new_draw_list = []
        if (statusCode === 200 && result != null) {
            result.forEach((room) => {
                new_draw_list.push(
                    <>
                        <RoomRow room={room}
                                 from={from}
                                 until={until}
                                 is_first_room_row={is_first_room_row}/>
                    </>
                )
                is_first_room_row = false
            })
        } else {
            for (let i = 0; i < elementsOnPage; i++) {
                new_draw_list.push(
                    <RoomRowSkeleton/>
                )
            }
        }
        return new_draw_list
    }

    return (
        <ContentWrapper page_name="Classrooms">
            <PaginatedList endpoint={'/api/v0/rooms'} resultHandler={resultHandler} additional_deps={[from, until]} limit={5}>
                <DateSelect setFromDate={setFrom} setUntilDate={setUntil}/>
            </PaginatedList>
        </ContentWrapper>
    );
}


export default RoomList;