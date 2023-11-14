import './Profile.css';

import React, { useEffect, useContext } from "react";
import ContentWrapper from "../components/Content";
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import useSomeAPI from "../api/FakeAPI";


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
