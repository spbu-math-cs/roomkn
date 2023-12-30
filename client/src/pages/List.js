import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useContext, useEffect, useState} from "react";
import {
    Box, Button,
    ListItemButton,
    Stack, Typography, Skeleton, IconButton, Divider,
} from "@mui/material";
import {toAPITime} from "../api/API";
import Timeline from "../components/TimelineForRoomList";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PaginatedList from "../components/PaginatedList";
import PushPinIcon from '@mui/icons-material/PushPin';
import {SnackbarContext} from "../components/SnackbarAlert";
import {getPinnedClassroomsFromStorage, SavePinnedClassroomsIntoStorage} from "../components/PinnedClassrooms";
import {useNavigate} from "react-router-dom";

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

    const params = new URLSearchParams()
    params.append("room_ids", [room_id])
    params.append("from", toAPITime(dateFrom, "00:00"))
    params.append("until", toAPITime(dateUntil, "23:59"))

    let {triggerFetch, finished} = useSomeAPI('/api/v0/reservations?' + params.toString(), null, 'GET', ReservationsCallback)

    let [reservations, setReservations] = useState(null)

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [room_id, dateFrom, dateUntil])

    function ReservationsCallback(result, statusCode) {
        console.log("all reservations for room " + room_id + " are (status code: " + statusCode + " ):")
        if (statusCode === 200 && result != null) {
            setReservations(result)
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
        const fromDelta = (7 - dateFrom.getDay()) % 7 - 6, untilDelta = (7 - dateUntil.getDay()) % 7
        dateFrom.setDate(dateFrom.getDate() + fromDelta)
        dateUntil.setDate(dateUntil.getDate() + untilDelta)
        setFromDate(dateFormat(dateFrom))
        setUntilDate(dateFormat(dateUntil))
    }

    function setNextWeekDate() {
        const dateFrom = new Date()
        const dateUntil = new Date()
        const fromDelta = (7 - dateFrom.getDay()) % 7 + 1, untilDelta = (7 - dateUntil.getDay()) % 7 + 7
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

function RoomRow({room, from, until, is_first_room_row, pinnedClassrooms, setPinnedClassrooms, is_pinned}) {

    const navigate = useNavigate()

    const link = "/room/" + String(room.id)

    function onClick() {
        navigate(link)
    }

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function onPinClick() {
        const newPinnedClassrooms = []
        pinnedClassrooms.forEach((pinned_room) => {
            if (pinned_room.id !== room.id)
                newPinnedClassrooms.push(pinned_room)
        })
        setNewMessageSnackbar("Classroom unpinned")
        setPinnedClassrooms(newPinnedClassrooms)
    }

    const pinIcon = (
        <IconButton color="primary" sx={{mt: is_first_room_row ? 2 : 0}}>
            <PushPinIcon onClick={onPinClick}/>
        </IconButton>
    )

    return (
        <Stack direction="row" justifyContent="space-around">
            {is_pinned ? pinIcon : <></>}
            <ListItemButton onClick={onClick} data-test-id={"link-" + room.id} sx={{mt: is_first_room_row ? 2 : 0}}>
                <Stack direction="row" alignItems="center" width="100%" spacing={5}>
                    <Box fontSize={20} sx={{width: 3/100}}>
                        <Typography align={"right"}>
                            {room.name}
                        </Typography>
                    </Box>

                    <TimelineForRoom room={room} fromDate={from} untilDate={until} show_time_labels={is_first_room_row}/>
                </Stack>
            </ListItemButton>
        </Stack>
    );
}

function Pinned({from, until, pinnedClassrooms, setPinnedClassrooms}) {

    let is_first_room_row = true
    const new_draw_list = []
    pinnedClassrooms.forEach((room) => {
        new_draw_list.push(
            <>
                <RoomRow room={room}
                         from={from}
                         until={until}
                         pinnedClassrooms={pinnedClassrooms}
                         setPinnedClassrooms={setPinnedClassrooms}
                         is_pinned={true}
                         is_first_room_row={is_first_room_row}/>
            </>
        )
        is_first_room_row = false
    })

    return (
        <>
            {new_draw_list}
            {pinnedClassrooms.length > 0 ?   <Divider width={"100%"}/> : ""}
        </>
    )
}

function RoomList() {

    const today = getTodayDate()

    const [from, setFrom] = useState(today)
    const [until, setUntil] = useState(today)

    const [pinnedClassrooms, setPinnedClassrooms] = useState(getPinnedClassroomsFromStorage())

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => SavePinnedClassroomsIntoStorage(pinnedClassrooms), [pinnedClassrooms])

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
                                 pinnedClassrooms={pinnedClassrooms}
                                 setPinnedClassrooms={setPinnedClassrooms}
                                 is_first_room_row={is_first_room_row}/>
                    </>
                )
                is_first_room_row = false
            })
        }
        while (new_draw_list.length < elementsOnPage) {
            new_draw_list.push(
                <RoomRowSkeleton/>
            )
        }
        return new_draw_list
    }




    return (
        <ContentWrapper page_name="Classrooms">
            <PaginatedList endpoint={'/api/v0/rooms'} resultHandler={resultHandler} additional_deps={[from, until]} limit={5}>
                <DateSelect from = {from} setFromDate={setFrom} until = {until} setUntilDate={setUntil}/>
                <Pinned from={from} until={until} pinnedClassrooms={pinnedClassrooms} setPinnedClassrooms={setPinnedClassrooms}/>
            </PaginatedList>
        </ContentWrapper>
    );
}


export default RoomList;