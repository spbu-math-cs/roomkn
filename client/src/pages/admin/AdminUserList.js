import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminUserList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Button, Checkbox, FormControlLabel, Stack, TextField, Typography} from "@mui/material";

function EditUserRow({user, refresh}) {

    const [name, setName] = useState(user.username)

    const put_data = {
            name: name
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
        triggerFetch: permGetTriggerFetch,
        finished: permGetFinished,
        result: permGetResult
    } = useSomeAPI("/api/v0/users/" + user.id + "/permissions")

    useEffect(() => {
        permGetTriggerFetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (permGetFinished) {
            const tmp_perms = permissionsDefault
            for (let perm in permGetResult) {
                tmp_perms[permGetResult[perm]] = true;
            }
            setPermissions(tmp_perms)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permGetFinished, permGetResult])


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

    const putObj = useSomeAPI("/api/v0/users/" + user.id, put_data, "PUT")
    const deleteObj = useSomeAPI("/api/v0/users/" + user.id, null, "DELETE")

    const [putStatusCode, triggerPut, putFinished] = [putObj.statusCode, putObj.triggerFetch, putObj.finished]
    const [deleteStatusCode, triggerDelete, deleteFinished] = [deleteObj.statusCode, deleteObj.triggerFetch, deleteObj.finished]

    const reset = () => {
        setName(user.username)
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
        <ContentWrapper page_name={user.id}>
            <Stack>
                <TextField sx={{maxWidth: "400px"}} label="Username" value={name}
                           onChange={(e) => setName(e.target.value)}/>
                <Typography fontSize="18pt">Permissions</Typography>
                <Stack sx={{paddingLeft: "10pt"}}>
                    {permissions_draw}
                </Stack>
                <Stack direction="row" spacing={2}>
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

    const addObj = useSomeAPI("/api/v0/users", put_data, "POST")

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
        <ContentWrapper page_name="Add user">
            <Stack direction="row">
                <TextField variant="outlined" value={name} onChange={(e) => setName(e.target.value)}/>
                <Button variant="contained" color="success" onClick={add_req}>add</Button>
            </Stack>
        </ContentWrapper>
    )
}

export function AdminUserList() {
    // const [refreshCount, setRefresh] = useState(0)
    // const refresh = () => {
    //     setRefresh(refreshCount+1)
    // }

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users')

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    const draw_list = []

    if (statusCode === 200 && finished && result != null) {
        result.forEach((user) => {
            draw_list.push(
                <EditUserRow user={user} key={user.id} refresh={triggerFetch}/>
            )
        })
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
            {draw_list}
            <AddUser refresh={triggerFetch}/>
        </AdminWrapper>
    )
}

export default AdminUserList