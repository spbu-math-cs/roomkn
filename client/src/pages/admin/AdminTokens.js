import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useContext, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Box, Button, SnackbarContent, Stack, TextField, useTheme} from "@mui/material";
import {SnackbarAlert, SnackbarContext} from "../../components/SnackbarAlert";

import {dateFormat, getTodayDate} from "../../api/API"

function TokenRow({tokenInfo, refresh}) {

    let {setNewMessageSnackbar} = useContext(SnackbarContext)

    // gets the token string

    let {triggerFetch} = useSomeAPI('/api/v0/users/invitations/' + tokenInfo.id, null, 'GET', tokenGetCallback)
    //eslint-disable-next-line react-hooks/exhaustive-deps
    // useEffect(() => triggerFetch(), [])

    let [token, setToken] = useState('')

    function tokenGetCallback(result, statusCode) {
        if (statusCode === 200) {
            setToken(result)
            setNewMessageSnackbar('Successfully retrieved token!')
        }
    }

    const {triggerFetch: triggerDelete} = useSomeAPI("/api/v0/users/invitations" + tokenInfo.id, null, "DELETE", deleteTokenCallback)

    const get_req = () => {
        if (token !== '') {
            setNewMessageSnackbar('This token has already been fetched.')
        }
        else {
            triggerFetch()
        }
    }

    const delete_req = () => {
        triggerDelete()
    }

    function deleteTokenCallback(result, statusCode) {
        if (statusCode === 200) {
            setNewMessageSnackbar('Token deleted. It is now invalid.')
            refresh()
        }
    }

    const theme = useTheme()

    return (
        <Stack direction="row" alignItems="baseline" spacing={theme.spacing()}>
            <Box sx={{minWidth: "30pt"}}>{tokenInfo.id}</Box>
            <TextField InputLabelProps={{shrink: true, readonly: true}}
                       label="Value"
                       variant="outlined" value={token}/>
            <TextField variant="outlined" label="Until" value={tokenInfo.until}/>
            <TextField variant="outlined" label="Remaining people" value={tokenInfo.remaining}/>
            <Button variant="contained" color="success" onClick={get_req}>retrieve</Button>
            <Button variant="outlined" color="error" onClick={delete_req}>delete</Button>
        </Stack>
    )
}

function AddToken({refresh}) {
    const [until, setUntil] = useState(getTodayDate())
    const [people, setPeople] = useState(1)

    let {setNewMessageSnackbar} = useContext(SnackbarContext)

    const put_data = {
        size: people,
        until: until
    }

    const {triggerFetch} = useSomeAPI("/api/v0/users/invite", put_data, "POST", createCallback)

    const add_req = () => {
        triggerFetch()
    }

    function createCallback(result, statusCode) {
        if (statusCode === 200) {
            // TODO clipboard
            setNewMessageSnackbar("Token created! The invite link has been copied to the clipboard.")
            refresh()
        }
        else {
            setNewMessageSnackbar('Token creation failed.')
        }
    }

    const theme = useTheme()

    return (
        <Stack direction="row" spacing={theme.spacing()}>
            <TextField label="Expires on" variant="outlined" value={until} onChange={(e) => setUntil(e.target.value)}/>
            <TextField label="Number of people able to be invited" variant="outlined" value={people} onChange={(e) => setPeople(e.target.value)}/>
            <Button variant="contained" color="success" onClick={add_req}>create</Button>
        </Stack>
    )
}

export function AdminTokenList() {
    
    let [drawList, setDrawList] = useState([])

    let {triggerFetch} = useSomeAPI('/api/v0/users/invitations', null, 'GET', listCallback)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    function listCallback(result, statusCode) {
        if (statusCode === 200) {
            const newList = []
            result.forEach((tokenInfo) => {
                newList.push(
                    <TokenRow tokenInfo={tokenInfo} refresh={triggerFetch}/>
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
            /Invites Panel
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
            <ContentWrapper page_name="Create new token">
                <AddToken refresh={triggerFetch}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminTokenList