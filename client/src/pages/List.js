import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect, useState} from "react";
import {Divider, List, ListItemButton, ListItemText} from "@mui/material";
import {fromAPITime} from "../api/API";
import TimelineForRoomList from "../components/TimelineForRoomList";

function GetReservations(room_id, date) {

    let {triggerFetch} = useSomeAPI('/api/v0/rooms/' + /*room_id*/ "4" + '/reservations', null, 'GET', ReservationsCallback)

    let [reservs, setReservs] = useState({
        reservations: null,
        triggerGetReservations: triggerFetch
    })

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [date])

    function ReservationsCallback(result, statusCode) {
        console.log("all reservations for room " + room_id + " are (status code: " + statusCode + " ):")
        console.log(result)
        if (statusCode === 200 && result != null) {
            setReservs({
                reservations: result.filter((reservation) => (fromAPITime(reservation.from).date === date)),
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

function TimelineForRoom({room}) {
    const date_string = new Date()
    const [date, setDate] = React.useState(date_string)
    const {reservations, triggerGetReservations} = GetReservations(room.id, date)

    console.log("reservations for room" + room.name + " " + room.id + "are:")
    console.log(reservations)

    return (
        <TimelineForRoomList reservations = {reservations}/>
    )
}

function RoomRow({room}) {

    const link = "/room/" + String(room.id)

    return (
        <ListItemButton href={link} data-test-id={"link-" + room.id}>
            <ListItemText primary={room.name} secondary={room.description}/>
            <TimelineForRoom room={room}/>
            <Divider/>
        </ListItemButton>
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