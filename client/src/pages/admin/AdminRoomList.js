import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";

function EditRoomRow({room, refresh}) {

    let {triggerFetch, result, statusCode, finished} = useSomeAPI('/api/v0/rooms/' + room.id)
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const [nameDefault] = useState(room.name)
    const [descDefault, setDescDefault] = useState(room.description)

    const [name, setName] = useState(room.name)
    const [desc, setDesc] = useState(room.description)

    useEffect(() => {
        if (finished && statusCode === 200 && result != null) {
            setDescDefault(result.description)
            setDesc(result.description)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result, finished, statusCode]);

    const put_data = {
        name: name,
        description: desc
    }

    const putObj = useSomeAPI("/api/v0/rooms/" + room.id, put_data, "PUT")
    const deleteObj = useSomeAPI("/api/v0/rooms/" + room.id, null, "DELETE")

    const [putStatusCode, triggerPut, putFinished] = [putObj.statusCode, putObj.triggerFetch, putObj.finished]
    const [deleteStatusCode, triggerDelete, deleteFinished] = [deleteObj.statusCode, deleteObj.triggerFetch, deleteObj.finished]

    const reset = () => {
        setName(nameDefault)
        setDesc(descDefault)
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
            refresh()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [putFinished])

    useEffect(() => {
        if (deleteFinished) {
            alert("Delete statusCode: " + deleteStatusCode)
            refresh()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

function AddRoom({refresh}) {
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")

    const put_data = {
        name: name,
        description: desc
    }

    const addObj = useSomeAPI("/api/v0/rooms", put_data, "POST")

    const [addStatusCode, triggerAdd, addFinished] = [addObj.statusCode, addObj.triggerFetch, addObj.finished]

    const add_req = () => {
        triggerAdd()
    }

    useEffect(() => {
        if (addFinished) {
            alert("Put statusCode: " + addStatusCode)
            refresh()
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addFinished])

    return (
        <div className="add-room-row">
            <input className="add-room-row-name" placeholder="New room name" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
            <input className="add-room-row-desc" placeholder="New room description" type="text" value={desc} onChange={(e) => setDesc(e.target.value)}/>
            <input className="add-room-row-add" type="button" value="ADD" onClick={add_req}/>
        </div>
    )
}

export function AdminRoomList() {
    // const [refreshCount, setRefresh] = useState(0)
    // const refresh = () => {
    //     setRefresh(refreshCount+1)
    // }

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms')

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const draw_list = []

    if (statusCode === 200 && finished && result != null) {
        result.forEach((room) => {
            draw_list.push(
                <EditRoomRow room={room} key={room.id} refresh={triggerFetch}/>
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
        <AdminWrapper>
            <ContentWrapper page_name={page_name}>
                {draw_list}
                <AddRoom refresh={triggerFetch}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminRoomList