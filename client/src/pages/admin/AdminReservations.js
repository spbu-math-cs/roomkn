import ContentWrapper from "../../components/Content";
import React, {createContext, useContext, useEffect, useState} from "react";
import AdminWrapper from "../../components/AdminWrapper";
import {NavLink} from "react-router-dom";
import useSomeAPI from "../../api/FakeAPI";
import {fromAPITime, toAPITime} from "../../api/API";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Stack, TextField,
    useTheme
} from "@mui/material";
import {SnackbarContext} from "../../components/SnackbarAlert";

const FiltersContext = createContext()

function useGetUsersShortInfo() {

    const [users, setUsers] = useState([])

    const usersCallback = (result, statusCode) => {
        if (result != null && statusCode === 200) {
            setUsers(result)
        }
        else setUsers([])
    }

    let {triggerFetch} = useSomeAPI('/api/v0/users', null, 'GET', usersCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), []);
    return users
}

function useGetRooms() {
    const [rooms, setRooms] = useState([])

    const roomsCallback = (result, statusCode) => {
        if (result != null && statusCode === 200) {
            setRooms(result)
        }
        else setRooms([])
    }

    let {triggerFetch} = useSomeAPI('/api/v0/rooms', null, 'GET', roomsCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), []);
    return rooms
}

function useGetUserName(user_id) {
    const [user_name, setUserName] = useState("")

    function getUserCallback(result, statusCode) {
        if (result != null && statusCode === 200) {
            setUserName(result.username)
        }
    }

    const {triggerFetch} = useSomeAPI("/api/v0/users/" + user_id, null, 'GET', getUserCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {triggerFetch()}, [user_id]);

    return user_name
}

function useGetRoomName(room_id) {
    const [room_name, setRoomName] = useState("")

    function getRoomCallback(result, statusCode) {
        if (result != null && statusCode === 200) {
            setRoomName(result.name)
        }
    }

    const {triggerFetch} = useSomeAPI("/api/v0/rooms/" + room_id, null, 'GET', getRoomCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {triggerFetch()}, [room_id]);

    return room_name
}

function Reservation({reservation}) {

    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)
    const room_id = reservation.room_id
    const user_id = reservation.user_id

    let [deleted, setDeleted] = useState(false)

    console.log("print reservations before" + reservation.room_id)

    let room_name = useGetRoomName(room_id)
    let user_name = useGetUserName(user_id)

    console.log("print reservation room id is " + room_id + " use: " + useGetRoomName(room_id) + " name " + "room_name: " + room_name)

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function deleteCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setDeleted(true)
            setNewMessageSnackbar("reservation deleted!")
        }
    }

    let {triggerFetch} = useSomeAPI("/api/v0/reservations/" + reservation.id, null, 'DELETE', deleteCallback)

    function deleteReservation () {
        triggerFetch()
    }

    if (deleted) return (<></>)

    return (
        <ContentWrapper page_name={reservation.id}>
            <Stack direction = "column">
                <Box>Room: {room_name}</Box>
                <Box>User: {user_name}</Box>
                <Box>Date: {from_obj.date}</Box>
                <Box>From: {from_obj.time}</Box>
                <Box>Until: {until_obj.time}</Box>
                <Button variant="outlined" color="error" onClick={deleteReservation} sx={{maxWidth: "40pt"}}>delete</Button>
            </Stack>
        </ContentWrapper>
    )
}

function useGetReservations(orderBy, from, until, userList, roomList) {
    const params = new URLSearchParams()
    if (userList.length > 0) params.append("user_ids", userList)
    if (roomList.length > 0)  params.append("room_ids", roomList)
    params.append("from", toAPITime(from, "00:00"))
    params.append("until", toAPITime(until, "23:59"))

    const url = "/api/v0/reservations?" + params.toString()

    console.log("url: " + url)

    let {triggerFetch} = useSomeAPI(
        url,
        null,
        'GET',
        getReservationsCallback
    )

    function getReservationsCallback(result, statusCode) {
        console.log("get reservations callback! result: " + result + " status code: " + statusCode)
        if (result != null && statusCode === 201) {
            //TODO: orderBy
            setResult({
                reservations: result,
                triggerGetReservations: () => {
                    triggerFetch()
                }
            })
        }
    }

    const[result, setResult] = useState({
        reservations: [],
        triggerGetReservations: () => {
            triggerFetch()
        }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    return result

}

function dateFormat(date, format = "yyyy-mm-dd") {
    let mlz = ""
    if (date.getMonth() + 1 < 10) mlz = "0"
    let dlz = ""
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

function Filters({triggerGetReservations}) {

    const {from, setFrom,
        until, setUntil,
        orderBy, setOrderBy,
        users, setUsers,
        rooms, setRooms} = useContext(FiltersContext)

    const allUsers = useGetUsersShortInfo()

    const allRooms = useGetRooms()

    const handleChangeUsers = (event) => {
        const {
            target: { value },
        } = event;

        setUsers(
            typeof value === 'string' ? value.split(',') : value,
        )
    }

    const handleChangeRooms = (event) => {
        const {
            target: { value },
        } = event;

        console.log("value: " + value + " " + typeof value)

        setRooms(
            typeof value === 'string' ? value.split(',') : value,
        );

        console.log("selected rooms: " + rooms)
    };

    const userMap = new Map()
    allUsers.forEach((user) => {userMap.set(user.id, user.username)})

    const roomMap = new Map()
    allRooms.forEach((room) => {roomMap.set(room.id, room.name)})

    const theme = useTheme()

    const onUpdate = () => {
        triggerGetReservations()
    }

    return (
        <Stack direction="row" spacing = {theme.spacing()}>
            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id="order-by-label-id">Order by</InputLabel>
                <Select
                    label="Order by:"
                    labelId="order-by-label-id"
                    id="order-by-select"
                    value = {orderBy}
                    onChange = {(e) => {setOrderBy(e.target.value)}}
                >
                    <MenuItem value = "reservation-date">Reservation date</MenuItem>
                    <MenuItem value = "user-name">User name</MenuItem>
                    <MenuItem value = "room-name">Room name</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id="select-users-label-id">Users:</InputLabel>
                <Select
                    multiple
                    label="Users:"
                    labelId="select-users-label-id"
                    id="users-select"
                    value={users}
                    onChange={handleChangeUsers}
                    renderValue={(selected) => selected.map((id) => userMap.get(id)).join(', ')}
                >
                    {allUsers.map((user) => (
                        <MenuItem value={user.id}>
                            <Checkbox checked={(users.indexOf(user.id) > -1)}/>
                            <ListItemText primary={user.username} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id="select-rooms-label-id">Rooms:</InputLabel>
                <Select
                    multiple
                    label="Rooms:"
                    labelId="select-rooms-label-id"
                    id="rooms-select"
                    value={rooms}
                    onChange={handleChangeRooms}
                    renderValue={(selected) => selected.map((id) => roomMap.get(id)).join(', ')}
                >
                    {allRooms.map((room) => (
                        <MenuItem value={room.id}>
                            <Checkbox checked={(rooms.indexOf(room.id) > -1)}/>
                            <ListItemText primary={room.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField id="date" label="From" type="date" defaultValue={from} onChange={(e) => {setFrom(e.target.value)}}/>
            <TextField id="date" label="Until" type="date" defaultValue={until} onChange={(e) => {setUntil(e.target.value)}}/>
            <Button variant="contained" color="success" onClick={onUpdate}>Update</Button>
        </Stack>
    )
}

function Reservations({reservations, orderBy}) {

    if (reservations.length === 0) return (
        <ContentWrapper page_name="No reservations found"/>
    )
    const drawList = []

    reservations.sort((a, b) => {
        if (orderBy === "reservation-date") {
            const a_from_obj = fromAPITime(a.from)
            const b_from_obj = fromAPITime(b.from)
            const aFromDate = new Date(a_from_obj.date, a_from_obj.time)
            const bFromDate = new Date(b_from_obj.date, b_from_obj.time)
            return aFromDate.getTime() < bFromDate.getTime()
        }
        else if (orderBy === "user-name") {
            return a.user_id < b.user_id
        }
        return a.room_id < b.room_id
    })

    reservations.forEach((reservation) => {
        drawList.push(<Reservation reservation={reservation}/> )
    })

    return <Stack direction = "column">
        {drawList}
    </Stack>
}

function AdminReservations() {
    const page_name = (
        <div>
            <NavLink to="/admin/panel">
                Admin Panel
            </NavLink>
            /Admin Reservations
        </div>
    )


    const today = getTodayDate()
    const [from, setFrom] = React.useState(today)
    const [until, setUntil] = React.useState(today)
    const [orderBy, setOrderBy] = useState("reservation-date")
    const [users, setUsers] = useState([])
    const [rooms, setRooms] = useState([])

    const {reservations, triggerGetReservations} = useGetReservations(orderBy, from, until, users, rooms)


    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function onUpdate() {
        setNewMessageSnackbar("Got reservations!")
        triggerGetReservations()
    }

    return (
        <AdminWrapper>
            <ContentWrapper page_name={page_name}>
            </ContentWrapper>
                <FiltersContext.Provider value = {{
                    from, setFrom,
                    until, setUntil,
                    orderBy, setOrderBy,
                    users, setUsers,
                    rooms, setRooms
                }}>
                <Stack spacing = {2} direction = "column">
                    <ContentWrapper page_name={"Filters"}>
                        <Filters triggerGetReservations={onUpdate}/>
                    </ContentWrapper>
                    <Reservations reservations={reservations} orderBy={orderBy}/>
                </Stack>
            </FiltersContext.Provider>
        </AdminWrapper>)
}

export default AdminReservations