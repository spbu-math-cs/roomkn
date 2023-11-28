import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect, useState} from "react";
import {Divider, List, ListItemButton, ListItemText} from "@mui/material";

function RoomRow({room}) {

    const link = "/room/" + String(room.id)

    return (
        <ListItemButton href={link} data-test-id={"link-" + room.id}>
            <ListItemText primary={room.name} secondary={room.description}/>
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
            <div className="room-list">
                {draw_list}
            </div>
        </ContentWrapper>
    );
}


export default RoomList;