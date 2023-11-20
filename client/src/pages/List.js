import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import React, {useEffect} from "react";
import {Divider, List, ListItemButton, ListItemText} from "@mui/material";

function RoomRow({room}) {

    const link = "/room/" + String(room.id)

    return (
        <ListItemButton href={link}>
            <ListItemText primary={room.name} secondary={room.description}/>
            <Divider/>
        </ListItemButton>
    );
}

function RoomList() {

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const draw_list = []

    if (statusCode === 200 && finished && result != null) {
        console.log(result)
        result.forEach((room) => {
            draw_list.push(<RoomRow room={room} key={room.id}/>)
        })
    }


    return (
        <ContentWrapper page_name="Classrooms">
            <List>
                {draw_list}
            </List>
        </ContentWrapper>
    );
}

export default RoomList;