import './Profile.css';

import React, { useEffect, useContext } from "react";
import ContentWrapper from "../components/Content";
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import useSomeAPI from "../api/FakeAPI";
 
function Profile() {

    const {current_user} = useContext(CurrentUserContext)
    const {isAuthorized} = useContext(IsAuthorizedContext)

    let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users/' + current_user?.user_id)

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetch(), [])

    console.log(current_user)

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
