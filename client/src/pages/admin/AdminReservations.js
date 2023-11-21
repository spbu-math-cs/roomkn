import ContentWrapper from "../../components/Content";
import React, {useEffect, useState} from "react";
import AdminWrapper from "../../components/AdminWrapper";
import {NavLink} from "react-router-dom";
import useSomeAPI from "../../api/FakeAPI";
import {fromAPITime} from "../../api/API";
import "./AdminReservations.css"


function useGetUsersShortInfo() {

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users')

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), []);
    if (statusCode === 200 && finished && result != null) return result
    return []
}

function useGetRooms() {
    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms')

    useEffect(() => triggerFetch(), []);
    if (statusCode === 200 && finished && result != null) return result
    return []
}

function useGetUserReservations(userId) {
    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/reservations/by-user/' + userId)

    useEffect(() => triggerFetch(), [userId]);

    if (finished && statusCode === 200 && result != null) return result
    return []
}

function Users() {
    const usersShortInfoList = useGetUsersShortInfo()
    let userList = []
    usersShortInfoList.forEach((shortUserInfo) => {
        userList.push(<li><label> Пользователь {shortUserInfo.username} номер {shortUserInfo.id}</label></li>)
    })

    // const allReservationsList = useGetAllReservations()
    // let reservationsList = []
    // allReservationsList.forEach((resevation) => {
    //     reservationsList.push(
    //         <li>
    //         <Reservation reservation={resevation}/>
    //         </li>
    //     )
    // })

    return <ul>
        {userList}
        {/*{reservationsList}*/}
    </ul>
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

function useGetAllReservations() {
    const usersShortInfoList = useGetUsersShortInfo()
    const allReservations = []
    usersShortInfoList.forEach((userShortInfo) => {
        // const reservations = useGetUserReservations(userShortInfo.id)
        const reservations = []
        reservations.forEach((reservation) => {
            allReservations.push(reservation)
        })
    })

    return allReservations
}

function changeOrderBy(newOrderBy) {
    //TODO
}

function changeFiltersVisibility() {
    const elem = document.getElementById("filters")
    if (elem.className === "filters-none") elem.className = "filters-ok"
    else elem.className = "filters-none"
}

function changeOnFromUntilChange(e) {
    e.preventDefault();
    alert("Ждем API...")
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

function UserInSelect({userInfo, form}) {
    let [checked, setChecked] = useState(true)
    const inputId = "take-user-" + userInfo.id
    return (
        <div>
            <input type="checkbox" id={inputId} form={form} checked={checked} onChange={() => {setChecked(!checked)}}/>
            <label>{userInfo.username}</label>
        </div>
    )
}

function RoomInSelect({roomInfo, form}) {
    let [checked, setChecked] = useState(false)
    const inputId = "take-user-" + roomInfo.name
    return (
        <div>
            <input type="checkbox" id={inputId} form={form} checked={checked} onChange={() => {setChecked(!checked)}}/>
            <label>{roomInfo.name}</label>
        </div>
    )
}

function UserSelect({form}) {
    const users = useGetUsersShortInfo()
    const usersWithCheckbox = []
    users.forEach((userInfo) => {
        usersWithCheckbox.push(
            <UserInSelect userInfo={userInfo} form={form}/>
        )
    })
    return (
        <fieldset>
            {usersWithCheckbox}
        </fieldset>
    )
}

function RoomsSelect({form}) {
    const rooms = useGetRooms()
    console.log("rooms:" + rooms)
    const roomsWithCheckbox = []
    rooms.forEach((roomInfo) => {
        roomsWithCheckbox.push(
            <RoomInSelect roomInfo={roomInfo} form={form}/>
        )
    })
    return (
        <fieldset>
            {roomsWithCheckbox}
        </fieldset>
    )
}

function Filters() {
    const today = getTodayDate()
    console.log(today + "T09:30")
    const [from, setFrom] = React.useState(today + "T09:30")
    const [until, setUntil] = React.useState(today + "T23:00")
    return (
        <table>
            <tbody>
            <tr>
                <td>
                    <button onClick={changeFiltersVisibility}> Фильтры </button>
                </td>
                <td>
                    Отсортировать по:
                    <select onChange={(e) => {
                        changeOrderBy(e.target.value)
                    }}>
                        <option value="users">Именам пользователей</option>
                        <option value="rooms">Комнатам</option>
                        <option value="time">Времени резервации</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td><div className="filters-none" id = "filters">
                    <form className="form-admin-reservation" onSubmit={changeOnFromUntilChange}>
                        <div>
                            <label>
                                От
                            </label>
                            <input type="datetime-local" value={from} onChange={(e) => {setFrom(e.target.value)}}/>
                        </div>
                        <div>
                            <label>
                                До
                            </label>
                            <input type="datetime-local" value={until} onChange={(e) => {setUntil(e.target.value)}}/>
                        </div>
                        <div>
                            Пользователи:
                            <UserSelect formId="form-admin-reservations"/>
                        </div>
                        <div>
                            Комнаты:
                            <RoomsSelect form="form-admin-reservations"/>
                        </div>
                        <input type="submit" value="Обновить"></input>
                    </form>

                </div></td>
            </tr>
            </tbody>
        </table>
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
                <Users/>
            </ContentWrapper>
        </AdminWrapper>)
}

export default AdminReservations