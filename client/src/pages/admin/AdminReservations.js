import ContentWrapper from "../../components/Content";
import React, {useEffect, useState} from "react";
import AdminWrapper from "../../components/AdminWrapper";
import {NavLink} from "react-router-dom";
import useSomeAPI from "../../api/FakeAPI";
import {fromAPITime} from "../../api/API";
import "./AdminReservations.css"

// function useGetUsers() {
// }

function useGetUsersShortInfo() {

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users')

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    for (let i = 0; i < usersShortInfoList.length; i++) {
        const userShortInfo = usersShortInfoList[i]
        // const reservations = useGetUserReservations(userShortInfo.id)
        const reservations = []
        reservations.forEach((reservation) => {
            allReservations.push(reservation)
        })
    }

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

function Filters() {
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
                    sdfsdfgffdfasdf
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