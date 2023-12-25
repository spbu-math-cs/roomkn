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
    Select, Skeleton,
    Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow,
    useTheme
} from "@mui/material";
import {SnackbarContext} from "../../components/SnackbarAlert";
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";

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
    const [user_name, setUserName] = useState(null)

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
    const [room_name, setRoomName] = useState(null)

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

function Reservation({reservation, display_user}) {

    const from_obj = fromAPITime(reservation.from)
    const until_obj = fromAPITime(reservation.until)
    const room_id = reservation.room_id
    const user_id = reservation.user_id

    let [deleted, setDeleted] = useState(false)

    let room_name = useGetRoomName(room_id)
    room_name = room_name ? room_name : (<Skeleton/>)
    let user_name = useGetUserName(user_id)
    user_name = user_name ? user_name : <Skeleton/>

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function deleteCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setDeleted(true)
            setNewMessageSnackbar("Reservation deleted!")
        }
        else {
            setNewMessageSnackbar("An error occurred.")
        }
    }

    let {triggerFetch} = useSomeAPI("/api/v0/reservations/" + reservation.id, null, 'DELETE', deleteCallback)

    function deleteReservation () {
        triggerFetch()
    }

    if (deleted) return (<></>)

    return (
        <TableRow
            key={reservation.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                {reservation.id}
            </TableCell>
            <TableCell align="right">
                {room_name}
            </TableCell>
            <TableCell align="right" sx={{display: display_user}}>
                {user_name}
            </TableCell>
            <TableCell align="right">
                {from_obj.date}
            </TableCell>
            <TableCell align="right">
                {from_obj.time}
            </TableCell>
            <TableCell align="right">
                {until_obj.time}
            </TableCell>
            <TableCell align="right">
                <Button variant="outlined" color="error" onClick={deleteReservation} sx={{maxWidth: "40pt"}}>delete</Button>
            </TableCell>
        </TableRow>
    )
}

function get_params(sortBy, sortOrder, from, until, userList, roomList, offset, limit) {
    // alert(sortBy + " " + sortOrder + " " + from + " " + until + " " + userList + " " + roomList + " " + offset + " " + limit)
    const params = new URLSearchParams()
    if (userList.length > 0) params.append("user_ids", userList)
    if (roomList.length > 0)  params.append("room_ids", roomList)
    if (offset != null) params.append("offset", offset)
    if (limit != null) params.append("limit", limit)
    params.append("from", toAPITime(from, "00:00"))
    params.append("until", toAPITime(until, "23:59"))
    params.append("sort_by", sortBy)
    params.append("sort_order", sortOrder)

    return params.toString()
}

function useGetReservations(sortBy, sortOrder, from, until, userList, roomList, offset, limit) {
    const params = get_params(sortBy, sortOrder, from, until, userList, roomList, offset, limit)

    const url = "/api/v0/reservations?" + params

    console.log("url: " + url)

    let {triggerFetch} = useSomeAPI(
        url,
        null,
        'GET',
        getReservationsCallback
    )

    function getReservationsCallback(result, statusCode) {
        console.log("get reservations callback! result: ", result + " status code: ", statusCode)
        if (result != null && statusCode === 200) {
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
    useEffect(() => triggerFetch(), [offset, limit])

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

function Filters({triggerGetReservations, display_user}) {

    const {from, setFrom,
        until, setUntil,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
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
                <InputLabel id="sort-by-lebel-id">Sort by</InputLabel>
                <Select
                    label="Sort by:"
                    labelId="sort-by-lebel-id"
                    id="sort-by-select"
                    value = {sortBy}
                    onChange = {(e) => {setSortBy(e.target.value)}}
                >
                    <MenuItem value = "date_from">Reservation from date</MenuItem>
                    <MenuItem value = "date_until">Reservation until date</MenuItem>
                    <MenuItem value = "owner_name">Owner name</MenuItem>
                    <MenuItem value = "room_name">Room name</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id="sort-order-lebel-id">Sort order:</InputLabel>
                <Select
                    label="Sort order:"
                    labelId="sort-order-lebel-id"
                    id="sort-order-select"
                    value = {sortOrder}
                    onChange = {(e) => {setSortOrder(e.target.value)}}
                >
                    <MenuItem value = "asc">Ascending</MenuItem>
                    <MenuItem value = "desc">Decreasing</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 200, display: display_user }}>
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="date" label="From" type="date" defaultValue={dayjs(from)}
                            onChange={(v) => {
                                setFrom(dateFormat(v.toDate()));
                            }}
                            format="DD.MM.YYYY"
                />
                <DatePicker id="date" label="Until" type="date" defaultValue={dayjs(until)}
                            onChange={(v) => {
                                setUntil(dateFormat(v.toDate()));
                            }}
                            format="DD.MM.YYYY"
                />
            </LocalizationProvider>
            <Button variant="contained" color="success" onClick={onUpdate}>Update</Button>
        </Stack>
    )
}

function Reservations({reservations, display_user}) {

    const drawList = []

    reservations.forEach((reservation) => {
        drawList.push(<Reservation reservation={reservation} display_user={display_user}/> )
    })

    return drawList
}

export function ReservationsList({is_admin=false, user_id=null}) {
    const [page, setPage] = React.useState(0);
    const [reservationsPerPage, setReservationsPerPage] = React.useState(10);
    const [reservationsCount, setReservationsCount] = React.useState(100);

    const offset = (page) * reservationsPerPage

    let default_users = []
    if (user_id != null) {
        default_users = [user_id]
    }

    const today = getTodayDate()
    const [from, setFrom] = React.useState(today)
    const [until, setUntil] = React.useState(today)
    const [sortBy, setSortBy] = useState("date_from")
    const [sortOrder, setSortOrder] = useState("asc")
    const [users, setUsers] = useState(default_users)
    const [rooms, setRooms] = useState([])

    const {reservations, triggerGetReservations} = useGetReservations(sortBy, sortOrder, from, until, users, rooms, offset, reservationsPerPage)

    function getSizeCallback(result, statusCode) {
        console.log("result: " + result)
        console.log("statusCode:"  + statusCode)
        if (statusCode === 200 && result != null) {
            setReservationsCount(result);
        }
    }

    const params = get_params(sortBy, sortOrder, from, until, users, rooms, offset, reservationsPerPage)
    let {triggerFetch: triggerFetchSize} = useSomeAPI('/api/v0/reservations/size?' + params, null, 'GET', getSizeCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetchSize(), [from, until, users, rooms])


    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function onUpdate() {
        setNewMessageSnackbar("Got reservations!")
        triggerGetReservations()
    }


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setReservationsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const display_user =  is_admin ? '' : 'none'

    return (
        <Box sx={{ml: 4, mr: 4}}>
            <FiltersContext.Provider value = {{
                from, setFrom,
                until, setUntil,
                sortBy, setSortBy,
                sortOrder, setSortOrder,
                users, setUsers,
                rooms, setRooms
            }}>
                <Stack spacing = {2} direction = "column">
                    <Filters triggerGetReservations={onUpdate} display_user={display_user}/>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Reservation Id</TableCell>
                                <TableCell align="right">Room name</TableCell>
                                <TableCell align="right" sx={{display: display_user}}>User</TableCell>
                                <TableCell align="right">Date</TableCell>
                                <TableCell align="right">From</TableCell>
                                <TableCell align="right">Until</TableCell>
                                <TableCell align="right">Delete</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <Reservations reservations={reservations} display_user={display_user} reservationsPerPage={reservationsPerPage}/>
                        </TableBody>
                    </Table>
                </Stack>
            </FiltersContext.Provider>
            <TablePagination
                sx={{paddingTop: 2}}
                component="div"
                count={reservationsCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={reservationsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                data-test-id="pagination-input"
            />
        </Box>
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
                <ReservationsList is_admin={true}/>
            </ContentWrapper>
        </AdminWrapper>)
}

export default AdminReservations