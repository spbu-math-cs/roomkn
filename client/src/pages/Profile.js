import './Profile.css';

import React, {useContext, useEffect, useState} from "react";
import ContentWrapper from "../components/Content";
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import useSomeAPI from "../api/FakeAPI";
import {Box, Button, Stack, TextField, Typography} from "@mui/material";


function ProfilePermissions({currentUser}) {

    let {
        triggerFetch,
        result,
        finished,
        statusCode
    } = useSomeAPI('/api/v0/users/' + currentUser?.user_id + '/permissions')

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [currentUser])
    console.log("used effect")

    if (statusCode === 200 && finished && result != null) {
        console.log("success in getting perms")
        const perm_draw = []
        for (let perm in result) {
            let s;
            console.log(perm)
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
            perm_draw.push(<li key={perm}>
                <label className='profile-user-perm'>{s}</label>
            </li>)
        }
        return <ul>{perm_draw}</ul>
    }
}

function ProfileChangeForm({id, actUsername, actEmail, triggerRefetch}) {

    const [username, setUsername] = useState(actUsername)
    const [email, setEmail] = useState(actEmail)

    const put_data = {
        username: username,
        email: email
    }

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users/' + id, put_data, 'PUT')

    useEffect(() => {
        if (finished) {
            if (statusCode === 400) alert("Error: " + result)
            else if (statusCode === 401) alert("Error: you are unauthorized.")
            else if (statusCode === 403) alert("You are not allowed to change your credentials.")
            else if (statusCode === 500) alert("Internal server error.")
            else if (statusCode === 200) {
                triggerRefetch()
                alert("Credentials updated successfully!")
            } else alert("Status Code: " + statusCode)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

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

    const {currentUser} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users/' + currentUser?.user_id)


    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [currentUser])


    console.log(currentUser)

    if (!isAuthorized) {
        return (
            <ContentWrapper page_name="My profile">
                Error: you are not authorized.
            </ContentWrapper>
        )
    }

    if (statusCode === 200 && finished && result != null) {


        return (
            <Stack>
                <ContentWrapper page_name="Profile info">
                    <Typography sx={{fontSize: 24}}>
                        <Box>Username: {result.username}</Box>
                        <Box>Email: {result.email}</Box>
                    </Typography>
                </ContentWrapper>
                <ContentWrapper page_name="Permissions">
                    <Typography sx={{fontSize: 24}}>
                        <ProfilePermissions currentUser={currentUser}></ProfilePermissions>
                    </Typography>
                </ContentWrapper>
                <Typography sx={{fontSize: 24}}>
                    <ProfileChangeForm id={currentUser?.user_id} actUsername={result.username} actEmail={result.email}
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
