import './Profile.css';

import React, {useContext, useEffect, useState} from "react";
import ContentWrapper from "../components/Content";
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import useSomeAPI from "../api/FakeAPI";
import {Box, Button, Stack, TextField, Typography} from "@mui/material";
import {SnackbarContext} from "../components/SnackbarAlert";


function ProfilePermissions({currentUser}) {

    let [permDraw, setPermDraw] = useState([])

    let {triggerFetch} = useSomeAPI('/api/v0/users/' + currentUser?.user_id + '/permissions', null, 'GET', permissionsCallback)


    function permissionsCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            console.log("success in getting perms")
            const newPermDraw = []
            for (let perm in result) {
                let s;
                switch (result[perm]) {
                    case "ReservationsCreate":
                        s = "You are allowed to make reservations."
                        break
                    case "ReservationsAdmin":
                        s = "You are allowed to view other users' reservations and edit them."
                        break
                    case "RoomsAdmin":
                        s = "You are allowed to change room names and descriptions as well as introduce new rooms."
                        break
                    case "UsersAdmin":
                        s = "You are allowed to manage all users in the network and change their permissions."
                        break
                    case "GroupsAdmin":
                        s = "You are allowed to manage all groups."
                        break
                    default:
                        s = "You are allowed to eat draniki."
                }
                newPermDraw.push(<li key={perm}>
                    <label className='profile-user-perm'>{s}</label>
                </li>)
            }
            setPermDraw(newPermDraw)
        }
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [currentUser])

    return <ul>{permDraw}</ul>
}

function ProfileChangeForm({id, actUsername, actEmail, triggerRefetch}) {

    const [username, setUsername] = useState(actUsername)
    const [email, setEmail] = useState(actEmail)

    const put_data = {
        username: username,
        email: email
    }

    let {triggerFetch} = useSomeAPI('/api/v0/users/' + id, put_data, 'PUT', profileChangeCallback)

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function profileChangeCallback(result, statusCode) {
        if (statusCode === 400) setNewMessageSnackbar("Error: " + result)
            else if (statusCode === 401) setNewMessageSnackbar("Error: you are unauthorized.")
            else if (statusCode === 403) setNewMessageSnackbar("You are not allowed to change your credentials.")
            else if (statusCode === 500) setNewMessageSnackbar("Internal server error.")
            else if (statusCode === 200) {
                triggerRefetch()
                setNewMessageSnackbar("Credentials updated successfully!")
            } else setNewMessageSnackbar("Status Code: " + statusCode)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        triggerFetch()
    }

    return (
        <ContentWrapper page_name="Change user info">
            <Stack spacing={1}>
                <TextField variant="outlined" label="New username" value={username}
                           onChange={(e) => setUsername(e.target.value)}/>
                <TextField variant="outlined" label="New email" value={email}
                           onChange={(e) => setEmail(e.target.value)}/>
                <Button color="secondary" variant="outlined" onClick={handleSubmit}
                        sx={{width: "100pt"}}>Change</Button>
            </Stack>
        </ContentWrapper>
    );
}

const Profile = () => {

    let [presult, setPresult] = useState(null)
    let [pstatusCode, setPstatusCode] = useState(0)

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    let {triggerFetch} = useSomeAPI('/api/v0/users/' + currentUser?.user_id, null, 'GET', profileCallback)


    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [currentUser])



    if (!isAuthorized) {
        return (
            <ContentWrapper page_name="My profile">
                Error: you are not authorized.
            </ContentWrapper>
        )
    }

    function profileCallback(result, statusCode) {
        if (statusCode === 200 && result != null) {
            setPresult(result)
            setPstatusCode(statusCode)
            if (result.username != currentUser?.username) {
                setCurrentUser({
                    username: result.username,
                    user_id: result.id
                })
            } 
        }
        else {
            setPresult(null)
            setPstatusCode(0)
        }
        
    }

    if (pstatusCode === 200) {
        return (
            <Stack>
                <ContentWrapper page_name="Profile info">
                    <Typography sx={{fontSize: 24}}>
                        <Box>Username: {presult.username}</Box>
                        <Box>Email: {presult.email}</Box>
                    </Typography>
                </ContentWrapper>
                <ContentWrapper page_name="Permissions">
                    <Typography sx={{fontSize: 24}}>
                        <ProfilePermissions currentUser={currentUser}></ProfilePermissions>
                    </Typography>
                </ContentWrapper>
                <Typography sx={{fontSize: 24}}>
                    <ProfileChangeForm id={currentUser?.user_id} actUsername={presult.username} actEmail={presult.email}
                                       triggerRefetch={triggerFetch}></ProfileChangeForm>
                </Typography>
            </Stack>
        )
    }
    
    return (
        <ContentWrapper page_name="My profile">
            Unable to fetch current user information.
        </ContentWrapper>
    )
    
};

export default Profile;
