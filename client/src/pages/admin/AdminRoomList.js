import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useContext, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Box, Button, Skeleton, Stack, TextField, useTheme} from "@mui/material";
import {SnackbarContext} from "../../components/SnackbarAlert";
import PaginatedList from "../../components/PaginatedList";

function EditRoomRow({room, refresh}) {

    let {setNewMessageSnackbar} = useContext(SnackbarContext)

    let {triggerFetch, loading} = useSomeAPI('/api/v0/rooms/' + room.id, null, 'GET', roomGetCallback)
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

    if (loading) {
        return (
            <EditRoomRowSkeleton/>
        )
    }

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

function EditRoomRowSkeleton() {
    const theme = useTheme()

    return (
        <Stack direction="row" alignItems="baseline" spacing={theme.spacing()}>
            <Skeleton sx={{minWidth: "30pt"}}/>
            <TextField label="Name" variant="outlined"  disabled/>
            <TextField InputLabelProps={{shrink: true}}
                       multiline
                       maxRows={4}
                       label="Description"
                       variant="outlined"  disabled/>
            <Button variant="outlined" color="secondary" disabled>reset</Button>
            <Button variant="contained" color="success" disabled>update</Button>
            <Button variant="outlined" color="error"  disabled>delete</Button>
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

    function resultHandler(result, statusCode, elementsOnPage) {
        const newList = []
        if (statusCode === 200) {
            result.forEach((room) => {
                newList.push(
                    <EditRoomRow room={room} key={room.id} refresh={triggerFetch}/>
                )
            })
        }
        while (newList.length < elementsOnPage) {
            newList.push(
                <EditRoomRowSkeleton/>
            )
        }
        return newList
    }

    const page_name = (
        <div>
            <NavLink to="/admin/panel">
                Admin Panel
            </NavLink>
            /Room list
        </div>
    )

    const [fetchFlag, setFetchFlag] = useState([])
    function triggerFetch() {
        setFetchFlag(fetchFlag+1)
    }

    return (
        <AdminWrapper>
            <ContentWrapper page_name={page_name}>
                <PaginatedList endpoint={'/api/v0/rooms'} resultHandler={resultHandler} limit={10} fetchFlag={fetchFlag}/>
            </ContentWrapper>
            <ContentWrapper page_name="Add room">
                <AddRoom refresh={triggerFetch}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminRoomList