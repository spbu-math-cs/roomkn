import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Box, Button, Pagination, Stack, TextField, useTheme} from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";

function EditRoomRow({room, refresh}) {

    let [snackbarVis, setSnackbarVis] = useState(false)
    let [putStatusCode, setPutStatusCode] = useState(0)

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

    const {triggerFetch: triggerPut} = useSomeAPI("/api/v0/rooms/" + room.id, put_data, "PUT", putDeleteCallback)
    const {triggerFetch: triggerDelete} = useSomeAPI("/api/v0/rooms/" + room.id, null, "DELETE", putDeleteCallback)



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

    function putDeleteCallback(result, statusCode) {
        setSnackbarVis(true)
        setPutStatusCode(statusCode)
        refresh()
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
            <SnackbarAlert label={"Status code: " + putStatusCode} shouldShow={snackbarVis} closeSelf={() => {
                setSnackbarVis(false)
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

    const {triggerFetch} = useSomeAPI("/api/v0/rooms", put_data, "POST", addCallback)

    const add_req = () => {
        triggerFetch()
    }

    function addCallback(result, statusCode) {
        if (statusCode === 200) {
            refresh()
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

    const [page, setPage] = React.useState(1);
    const [pageCount, setPageCount] = React.useState(10);
    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const limit = 10
    const offset = (page - 1) * limit

    const pagination_query = `?offset=${offset}&limit=${limit}`

    let {triggerFetch} = useSomeAPI('/api/v0/rooms' + pagination_query, null, 'GET', listCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [limit, offset])

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
                <Stack alignItems="center"  sx={{paddingTop: 4}}>
                    <Pagination count={pageCount} page={page} onChange={handleChangePage} sx={{justifyContent:"center"}} />
                </Stack>
            </ContentWrapper>
            <ContentWrapper page_name="Add room">
                <AddRoom refresh={triggerFetch}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminRoomList