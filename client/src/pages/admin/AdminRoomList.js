import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useContext, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Box, Button, Stack, TextField, useTheme} from "@mui/material";
import {SnackbarContext} from "../../components/SnackbarAlert";

function EditRoomRow({room, refresh}) {

    let {setNewMessageSnackbar} = useContext(SnackbarContext)

    let {triggerFetch} = useSomeAPI('/api/v0/rooms/' + room.id, null, 'GET', roomGetCallback)
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const [nameDefault] = useState(room.name)
    const [descDefault, setDescDefault] = useState(room.description)

    const [name, setName] = useState(room.name)
    const [desc, setDesc] = useState(room.description)

    function roomGetCallback(result, statusCode) {
        if (statusCode === 200) {
            console.log('setting room description to' + result.description)
            setDescDefault(result.description)
            setDesc(result.description)
        }
    }

    const put_data = {
        name: name,
        description: desc
    }

    const {triggerFetch: triggerPut} = useSomeAPI("/api/v0/rooms/" + room.id, put_data, "PUT", putCallback)
    const {triggerFetch: triggerDelete} = useSomeAPI("/api/v0/rooms/" + room.id, null, "DELETE", deleteCallback)



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

    function deleteCallback(result, statusCode) {
        if (statusCode === 200) {
            setNewMessageSnackbar("Room deleted successfully!")
            refresh()
        }
        else {
            setNewMessageSnackbar("An error occurred.")
        }
    }

    function putCallback(result, statusCode) {
        if (statusCode === 200) {
            setNewMessageSnackbar("Room updated successfully!")
            refresh()
        }
        else {
            setNewMessageSnackbar("An error occurred.")
        }
    }

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
        </Stack>
    )
}

function AddRoom({refresh}) {
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    const put_data = {
        name: name,
        description: desc
    }

    const {triggerFetch} = useSomeAPI("/api/v0/rooms", put_data, "POST", addCallback)

    const add_req = () => {
        triggerFetch()
    }

    function addCallback(result, statusCode) {
        if (statusCode === 200) {
            refresh()
            setNewMessageSnackbar("Room added successfully!")
        }
        else {
            setNewMessageSnackbar("An error occurred.")
        }
    }

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
    
    let [drawList, setDrawList] = useState([])

    let {triggerFetch} = useSomeAPI('/api/v0/rooms', null, 'GET', listCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    function listCallback(result, statusCode) {
        if (statusCode === 200) {
            const newList = []
            result.forEach((room) => {
                newList.push(
                    <EditRoomRow room={room} key={room.id} refresh={triggerFetch}/>
                )
            })
            setDrawList(newList)
        }
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
                    {drawList}
                </Stack>
            </ContentWrapper>
            <ContentWrapper page_name="Add room">
                <AddRoom refresh={triggerFetch}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminRoomList