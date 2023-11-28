import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminUserList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Button, Checkbox, FormControlLabel, Stack, TextField, Typography, useTheme} from "@mui/material";

function EditUserRow({user, refresh}) {

    const [name, setName] = useState(user.username)
    const [email, setEmail] = useState('')

    const put_data = {
        name: name,
        email: email
    }

    const permissionsDefault = {
        "ReservationsCreate": false,
        "ReservationsAdmin": false,
        "RoomsAdmin": false,
        "UsersAdmin": false,
        "GroupsAdmin": false
    }
    const [permissions, setPermissions] = useState(permissionsDefault)


    const checked_perms = []
    for (var perm in permissions) {
        if (permissions[perm]) checked_perms.push(perm)
    }

    const {
        triggerFetch: infoTriggerFetch
    } = useSomeAPI("/api/v0/users/" + user.id, null, 'GET', infoGetCallback)

    const {
        triggerFetch: permGetTriggerFetch
    } = useSomeAPI("/api/v0/users/" + user.id + "/permissions", null, 'GET', permGetCallback)

    useEffect(() => {
        infoTriggerFetch()
        permGetTriggerFetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function infoGetCallback(result, statusCode) {
        if (statusCode === 200) {
            setName(result.username)
            setEmail(result.email)
        }
    }

    function permGetCallback(result, statusCode) {
        console.log('callback entered')
        if (statusCode === 200) {
            const tmp_perms = permissionsDefault
            for (let perm in result) {
                tmp_perms[result[perm]] = true;
            }
            console.log('setting perms')
            setPermissions(tmp_perms)
        } 
    }


    const permissions_draw = []
    if (permissions != null) {
        for (let perm in permissions) {
            console.log(user.id, permissions[perm])
            const onchange = (e) => {
                console.log("changed perm")
                const tmp_perms2 = permissions
                tmp_perms2[perm] = !permissions[perm];
                // console.log("sdsdsdfsdg", tmp_perms2)
                setPermissions(tmp_perms2)
            }
            permissions_draw.push(
                <FormControlLabel
                    control={<Checkbox checked={permissions[perm]} onChange={onchange}/>}
                    label={perm}/>
            )
        }
    }

    const {triggerFetch: triggerPut} = useSomeAPI("/api/v0/users/" + user.id, put_data, "PUT", putDeleteCallback)
    const {triggerFetch: triggerDelete} = useSomeAPI("/api/v0/users/" + user.id, null, "DELETE", putDeleteCallback)

    const reset = () => {
        setName(user.username)
    }

    const put_req = () => {
        triggerPut()
    }

    const delete_req = () => {
        triggerDelete()
    }

    function putDeleteCallback(result, statusCode) {
        if (statusCode === 200) {
            refresh()
        }
    }

    const theme = useTheme();

    return (
        <ContentWrapper page_name={user.id}>
            <Stack>
                <TextField sx={{maxWidth: "400px"}} label="Username" value={name}
                           onChange={(e) => setName(e.target.value)}/>
                <TextField sx={{maxWidth: "400px"}} label="Email" value={email}
                           onChange={(e) => setEmail(e.target.value)}/>
                <Typography fontSize="18pt">Permissions</Typography>
                <Stack sx={{paddingLeft: "10pt"}}>
                    {permissions_draw}
                </Stack>
                <Stack direction="row" spacing={theme.spacing()}>
                    <Button variant="outlined" color="secondary" onClick={reset}>reset</Button>
                    <Button variant="contained" color="success" onClick={put_req}>update</Button>
                    <Button variant="outlined" color="error" onClick={delete_req}>delete</Button>
                </Stack>
            </Stack>
        </ContentWrapper>
    )
}

function AddUser({refresh}) {
    const [name, setName] = useState("New user name")

    const put_data = {
        name: name,
    }

    const {triggerFetch: triggerAdd} = useSomeAPI("/api/v0/users", put_data, "POST", postCallback)

    const add_req = () => {
        triggerAdd()
    }

    function postCallback(result, statusCode) {
        if (statusCode === 200) {
            refresh()
        }
    }

    return (
        <ContentWrapper page_name="Add user">
            <Stack direction="row">
                <TextField variant="outlined" value={name} onChange={(e) => setName(e.target.value)}/>
                <Button variant="contained" color="success" onClick={add_req}>add</Button>
            </Stack>
        </ContentWrapper>
    )
}

export function AdminUserList() {

    let [drawList, setDrawList] = useState([])

    let {triggerFetch} = useSomeAPI('/api/v0/users', null, 'GET', listCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    function listCallback(result, statusCode) {
        if (statusCode === 200) {
            const newList = []
            result.forEach((user) => {
                newList.push(
                    <EditUserRow user={user} key={user.id} refresh={triggerFetch}/>
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
            /user list
        </div>
    )

    return (
        <AdminWrapper>

            <ContentWrapper page_name={page_name}/>
            {drawList}
            <AddUser refresh={triggerFetch}/>
        </AdminWrapper>
    )
}

export default AdminUserList