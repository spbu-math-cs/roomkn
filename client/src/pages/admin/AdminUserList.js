import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useContext, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminUserList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {
    Button,
    Checkbox,
    FormControlLabel, Pagination,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { CurrentUserContext } from "../../components/Auth";

function EditUserRow({user, refresh}) {

    const [name, setName] = useState(user.username)
    const [email, setEmail] = useState('')

    const put_data = {
        username: name,
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
    const [permissionsBefore, setPermissionsBefore] = useState(permissionsDefault)


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

    const {
        triggerFetch: permPutTriggerFetch
    } = useSomeAPI('/api/v0/users/' + user.id + '/permissions', checked_perms, 'PUT', permPutCallback)

    useEffect(() => {
        infoTriggerFetch()
        permGetTriggerFetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function permPutCallback(result, statusCode) {
        if (statusCode === 200) {
            permGetTriggerFetch()
        }
    }

    function infoGetCallback(result, statusCode) {
        if (statusCode === 200) {
            setName(result.username)
            setEmail(result.email)
        }
    }

    function permGetCallback(result, statusCode) {
        // console.log('callback entered')
        if (statusCode === 200) {
            const tmp_perms = permissionsDefault
            for (let perm in result) {
                tmp_perms[result[perm]] = true;
            }
            // console.log('setting perms')
            setPermissionsBefore(JSON.parse(JSON.stringify(tmp_perms)))
            setPermissions(JSON.parse(JSON.stringify(tmp_perms)))
        } 
    }

    function PermCheckbox({perm, label, was, on_change}) {

        var boxColor
        
        if (perm) {
            if (was) boxColor = 'primary'
            else boxColor = 'success'
        }
        else {
            if (was) boxColor = 'secondary'
            else boxColor = 'error'
        }

        return (
            <FormControlLabel
                control={<Checkbox checked={perm} color={boxColor} onChange={on_change}/>}
                label={
                    <Typography color={boxColor}>
                        {label}
                    </Typography>
                }
            />
        )
    }

    console.log('rerendering user')

    const permissions_draw = []
    if (permissions != null) {
        for (let perm in permissions) {
            //console.log(user.id, permissions[perm])
            function onchange(e) {
                const tmp_perms2 = JSON.parse(JSON.stringify(permissions))
                tmp_perms2[perm] = !permissions[perm]
                // console.log("sdsdsdfsdg", tmp_perms2)
                setPermissions(JSON.parse(JSON.stringify(tmp_perms2)))
            }
            
            permissions_draw.push(
                <PermCheckbox perm={permissions[perm]} was={permissionsBefore[perm]} on_change={onchange} label={perm}></PermCheckbox>
                // <FormControlLabel
                //     control={<Checkbox checked={permissions[perm]} onChange={onchange}/>}
                //     label={perm}/>
            )
        }
    }

    const {triggerFetch: triggerPut} = useSomeAPI("/api/v0/users/" + user.id, put_data, "PUT", putDeleteCallback)
    const {triggerFetch: triggerDelete} = useSomeAPI("/api/v0/users/" + user.id, null, "DELETE", putDeleteCallback)

    const reset = () => {
        infoTriggerFetch()
        setPermissions(JSON.parse(JSON.stringify(permissionsBefore)))
    }

    const put_req = () => {
        triggerPut()
        permPutTriggerFetch()
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
            <Stack direction="row">
                <TextField sx={{maxWidth: "400px", paddingRight: "20px"}} label="Username" value={name}
                           onChange={(e) => setName(e.target.value)}/>
                <TextField sx={{maxWidth: "400px"}} label="Email" value={email}
                           onChange={(e) => setEmail(e.target.value)}/>
            </Stack>
            <Typography fontSize="18pt">Permissions</Typography>
            <Stack sx={{paddingLeft: "10pt"}}>
                {permissions_draw}
            </Stack>
            <Stack direction="row" spacing={theme.spacing()}>
                <Button variant="outlined" color="secondary" onClick={reset}>reset</Button>
                <Button variant="contained" color="success" onClick={put_req}>update</Button>
                <Button variant="outlined" color="error" onClick={delete_req}>delete</Button>
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

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext)

    const [page, setPage] = React.useState(1);
    const [pageCount, setPageCount] = React.useState(10);
    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const limit = 10
    const offset = (page - 1) * limit

    const pagination_query = `?offset=${offset}&limit=${limit}`

    let {triggerFetch} = useSomeAPI('/api/v0/users' + pagination_query, null, 'GET', listCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [limit, offset])

    function listCallback(result, statusCode) {
        if (statusCode === 200) {
            const newList = []
            result.forEach((user) => {
                if (user.id === currentUser?.user_id) {
                    if (user.username !== currentUser?.username) {
                        console.log("changed context")
                        setCurrentUser({
                            user_id: user.id,
                            username: user.username
                        })
                    }
                }
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

            <ContentWrapper page_name={page_name}>
                <Stack alignItems="center"  sx={{paddingBottom: 1}}>
                    <Pagination count={pageCount} page={page} onChange={handleChangePage} sx={{justifyContent:"center"}} />
                </Stack>
                {drawList}
            </ContentWrapper>
            <AddUser refresh={triggerFetch}/>
        </AdminWrapper>
    )
}

export default AdminUserList