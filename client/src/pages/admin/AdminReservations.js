import ContentWrapper from "../../components/Content";
import React, {useEffect, useState} from "react";
import AdminWrapper from "../../components/AdminWrapper";
import {NavLink} from "react-router-dom";
import useSomeAPI from "../../api/FakeAPI";
import {fromAPITime} from "../../api/API";
import {
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

    useEffect(() => triggerFetch(), []);
    return rooms
}

function Reservation({reservation}) {

    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)
    const room_id = reservation.room_id

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms/' + room_id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    if (statusCode === 200 && result != null && finished) {
        const room_name = result.name
        return <label className='reservation-info-label'>
            Комната {room_name} заразервирована
            человком {reservation.user_id} на {from_obj.date} с {from_obj.time} по {until_obj.time}
        </label>
    }
    return <div></div>
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

function Filters() {
    const today = getTodayDate()
    const [from, setFrom] = React.useState(today + "T09:30")
    const [until, setUntil] = React.useState(today + "T23:00")
    const [orderBy, setOrderBy] = useState("")
    const [selectedUserIds, setSelectedUserIds] = useState([])
    const [selectedRoomsIds, setSelectedRoomsIds] = useState([])

    console.log((selectedRoomsIds.indexOf("1")))

    const users = useGetUsersShortInfo()

    const rooms = useGetRooms()

    const handleChangeUsers = (event) => {
        const {
            target: { value },
        } = event;

        setSelectedUserIds(
            typeof value === 'string' ? value.split(',') : value,
        )
    }

    const handleChangeRooms = (event) => {
        const {
            target: { value },
        } = event;

        console.log("value: " + value + " " + typeof value)

        setSelectedRoomsIds(
            typeof value === 'string' ? value.split(',') : value,
        );

        console.log("selected rooms: " + selectedRoomsIds)
    };

    const userMap = new Map()
    users.forEach((user) => {userMap.set(user.id, user.username)})

    const roomMap = new Map()
    rooms.forEach((room) => {roomMap.set(room.id, room.name)})

    const theme = useTheme()

    const date = getTodayDate()

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
                    value={selectedUserIds}
                    onChange={handleChangeUsers}
                    renderValue={(selected) => selected.map((id) => userMap.get(id)).join(', ')}
                >
                    {users.map((user) => (
                        <MenuItem value={user.id}>
                            <Checkbox checked={(selectedUserIds.indexOf(user.id) > -1)}/>
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
                    value={selectedRoomsIds}
                    onChange={handleChangeRooms}
                    renderValue={(selected) => selected.map((id) => roomMap.get(id)).join(', ')}
                >
                    {rooms.map((room) => (
                        <MenuItem value={room.id}>
                            <Checkbox checked={(selectedRoomsIds.indexOf(room.id) > -1)}/>
                            <ListItemText primary={room.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField id="date" label="From" type="date" defaultValue={date} onChange={(e) => {setFrom(e.target.value)}}/>
            <TextField id="date" label="Until" type="date" defaultValue={date} onChange={(e) => {setUntil(e.target.value)}}/>
            <Button variant="contained" color="success" onClick={() => {}}>Update</Button>
        </Stack>
    )
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
    return (
        <AdminWrapper>
            <ContentWrapper page_name={page_name}>
                <Filters/>
            </ContentWrapper>
        </AdminWrapper>)
}

export default AdminReservations