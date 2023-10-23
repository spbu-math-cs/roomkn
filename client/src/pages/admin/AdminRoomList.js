import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"

function EditRoomRow({room}) {

    const [name, setName] = useState(room.name)
    const [desc, setDesc] = useState(room.description)

    const put_data = {
        name: name,
        description: desc
    }

    const putObj = useSomeAPI("/rooms/" + room.id + "/edit", put_data, "PUT")
    const deleteObj = useSomeAPI("/rooms/" + room.id + "/remove", null, "DELETE")

    const [putStatusCode, triggerPut, putFinished] = [putObj.statusCode, putObj.triggerFetch, putObj.finished]
    const [deleteStatusCode, triggerDelete, deleteFinished] = [deleteObj.statusCode, deleteObj.triggerFetch, deleteObj.finished]

    const reset = () => {
        setName(room.name)
        setDesc(room.description)
    }

    const put_req = () => {
        triggerPut()
    }

    const delete_req = () => {
        triggerDelete()
    }

    useEffect(() => {
        if (putFinished) {
            alert("Put statusCode: " + putStatusCode)
        }
    }, [putFinished])

    useEffect(() => {
        if (deleteFinished) {
            alert("Delete statusCode: " + deleteStatusCode)
        }
    }, [deleteFinished])


    return (
        <div className="edit-room-row">
            <div className="edit-room-row-id">
                    {room.id}
            </div>
            <input className="edit-room-row-reset" type="button" value="reset" onClick={reset}/>
            <input className="edit-room-row-name" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
            <input className="edit-room-row-desc" type="text" value={desc} onChange={(e) => setDesc(e.target.value)}/>


            <input className="edit-room-row-update" type="button" value="UPDATE" onClick={put_req}/>
            <input className="edit-room-row-delete" type="button" value="delete" onClick={delete_req}/>
        </div>
    )
}

function AddRoom() {
    const [name, setName] = useState("New room name")
    const [desc, setDesc] = useState("New room description")

    const put_data = {
        name: name,
        description: desc
    }

    const addObj = useSomeAPI("/rooms/create", put_data, "PUT")

    const [addStatusCode, triggerAdd, addFinished] = [addObj.statusCode, addObj.triggerFetch, addObj.finished]

    const add_req = () => {
        triggerAdd()
    }

    useEffect(() => {
        if (addFinished) {
            alert("Put statusCode: " + addStatusCode)
        }
    }, [addFinished])

    return (
        <div className="add-room-row">
            <input className="add-room-row-name" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
            <input className="add-room-row-desc" type="text" value={desc} onChange={(e) => setDesc(e.target.value)}/>
            <input className="add-room-row-add" type="button" value="ADD" onClick={add_req}/>
        </div>
    )
}

export function AdminRoomList() {

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms')

    useEffect(() => triggerFetch(), [])

    const draw_list = []

    if (statusCode === 200 && finished) {
        result.forEach((room) => {
            draw_list.push(
                <EditRoomRow room={room}/>
        )
        })
    }

    const page_name = (
        <div>
            <NavLink to="/admin/panel">
                Admin Panel
            </NavLink>
            /Room list
        </div>
    )

    return (
        <ContentWrapper page_name={page_name}>
            {draw_list}
            <AddRoom/>
        </ContentWrapper>
    )
}

export default AdminRoomList