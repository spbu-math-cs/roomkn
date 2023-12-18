import './UserReservation.css';

import ContentWrapper from '../components/Content';
import React, {useContext} from 'react';
import {CurrentUserContext} from "../components/Auth";
import {ReservationsList} from "./admin/AdminReservations"


function UserReservations() {
    const page_name = "Reservations"

    const {currentUser} = useContext(CurrentUserContext)

    return (
        <ContentWrapper page_name = {page_name}>
            <ReservationsList user_id={currentUser.user_id}/>
        </ContentWrapper>
    )
}

export default UserReservations;