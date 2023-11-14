import './Profile.css';

import React, { useEffect, useContext, useState } from "react";
import ContentWrapper from "../components/Content";
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import useSomeAPI from "../api/FakeAPI";
import { Form } from 'react-router-dom';


function ProfilePermissions({currentUser}) {

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users/' + currentUser?.user_id + '/permissions')

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

    const handleSubmit = (e) => {
        e.preventDefault()

        triggerFetch()
        triggerRefetch()
    }

    return (
        <ContentWrapper page_name="Change credentials">
            <form className="credentials-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label className="form-label">
                        New username:
                    </label>
                    <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)}>
                  
                    </input>
                </div>
                <div className="form-field">
                    <label className="form-label">
                        New email:
                    </label>
                    <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)}>
                  
                    </input>
                </div>
                <input className="form-submit" type="submit" value="Change"></input>
            </form>
        </ContentWrapper>
    )

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
            <ContentWrapper page_name="My Profile">
                <div className='profile-field'> My username: {result.username}</div>
                <div className='profile-field'> My email: {result.email}</div>
                <div className='profile-field'>My permissions:</div>
                <ProfilePermissions currentUser={currentUser}></ProfilePermissions>
                <ProfileChangeForm id={currentUser?.user_id} actUsername={result.username} actEmail={result.email} triggerRefetch={triggerFetch}></ProfileChangeForm>
            </ContentWrapper>
        )
    }

    return (
        <ContentWrapper page_name="My profile">
            Unable to fetch current user information.
        </ContentWrapper>
    )
};
 
export default Profile;
