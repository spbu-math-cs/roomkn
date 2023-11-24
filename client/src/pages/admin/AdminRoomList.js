import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Box, Button, Stack, TextField, useTheme} from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";

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

    const [putStatusCode, triggerPut, putFinished, setPutFinished] = [putObj.statusCode, putObj.triggerFetch, putObj.finished, putObj.setFinished]
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
            // alert("Put statusCode: " + putStatusCode)
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

    const theme = useTheme()

    return (
        <Stack direction="row" alignItems="baseline" spacing={theme.spacing()}>
            <Box sx={{minWidth: "30pt"}}>{room.id}</Box>
            <TextField label="Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)}/>
            <TextField InputLabelProps={{shrink: true}}
                       multiline
                       maxRows={4}
                       label="Description"
                       variant="outlined" value={desc}
                       onChange={(e) => setDesc(e.target.value)}/>
            <Button variant="outlined" color="secondary" onClick={reset}>reset</Button>
            <Button variant="contained" color="success" onClick={put_req}>update</Button>
            <Button variant="outlined" color="error" onClick={delete_req}>delete</Button>
            <SnackbarAlert label={"Status code: " + putStatusCode} shouldShow={putFinished} closeSelf={() => {
                setPutFinished(false)
            }}/>
        </Stack>
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

    const theme = useTheme()

    return (
        <Stack direction="row" spacing={theme.spacing()}>
            <TextField label="Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)}/>
            <TextField label="Description" variant="outlined" value={desc} onChange={(e) => setDesc(e.target.value)}/>
            <Button variant="contained" color="success" onClick={add_req}>add</Button>
        </Stack>
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

    const theme = useTheme()

    return (
        <AdminWrapper>
            <ContentWrapper page_name={page_name}>
                <Stack spacing={theme.spacing()}>
                    {draw_list}
                </Stack>
            </ContentWrapper>
            <ContentWrapper page_name="Add room">
                <AddRoom refresh={triggerFetch}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminRoomList