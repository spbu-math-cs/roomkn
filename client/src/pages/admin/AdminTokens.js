import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useContext, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import copy from 'copy-to-clipboard';

import "./AdminRoomList.css"
import AdminWrapper from "../../components/AdminWrapper";
import {Box, Button, Stack, TextField, useTheme} from "@mui/material";
import {SnackbarContext} from "../../components/SnackbarAlert";

import {dateFormat, getTodayDate, toAPITime} from "../../api/API"
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";

function TokenRow({tokenInfo, refresh}) {

    let {setNewMessageSnackbar} = useContext(SnackbarContext)

    // gets the token string

    let {triggerFetch} = useSomeAPI('/api/v0/users/invitations/' + tokenInfo.id, null, 'GET', tokenGetCallback, false)
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
                       disabled={token === ''}
                       label="Invite link"
                       variant="outlined" value={constructInviteLink(token)}/>
            <TextField readOnly variant="outlined" label="Until" value={tokenInfo.until}/>
            <TextField readOnly variant="outlined" label="Remaining people" value={tokenInfo.remaining}/>
            <Button variant="contained" color="success" onClick={get_req}>show</Button>
            <Button variant="outlined" color="error" onClick={delete_req}>delete</Button>
        </Stack>
    )
}

function AddToken({refresh}) {
    const [until, setUntil] = useState(getTodayDate())
    const [people, setPeople] = useState(1)
    const [token, setToken] = useState('')
    const [tokenVisible, setTokenVisible] = useState(false)

    let {setNewMessageSnackbar} = useContext(SnackbarContext)

    const [putData, setPutData] = useState({
        size: people,
        until: toAPITime(until, "23:59")
    })


    const {triggerFetch} = useSomeAPI("/api/v0/users/invite", putData, "POST", createCallback, false)

    const add_req = () => {
        setPutData ({
            size: people,
            until: toAPITime(until, "23:59")
        })
        setTokenVisible(false)
        triggerFetch()
    }

    function createCallback(result, statusCode) {
        if (statusCode === 200) {

            let fullToken = constructInviteLink(result)

            // copy to clipboard
            copy(constructInviteLink(result))

            setToken(fullToken)
            setTokenVisible(true)
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="date" label="Expires on" type="date" value={dayjs(until)}
                            onChange={(v) => {
                                setUntil(dateFormat(v.toDate()));
                            }}
                            format="DD.MM.YYYY"
                    />
                <TextField label="Max people" variant="outlined" value={people} onChange={(e) => setPeople(e.target.value)}/>
                <Button variant="contained" color="success" onClick={add_req}>create</Button>
                {tokenVisible && <TextField InputLabelProps={{readonly: true}} label="Generated link" variant="outlined" value={token}/>}
            </LocalizationProvider>
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

function constructInviteLink(token) {
    if (token === '') return ''
    const inviteLink = window.location.href.split('admin')[0] + 'invite/' + token
    console.log(inviteLink)
    return inviteLink
}

export default AdminTokenList