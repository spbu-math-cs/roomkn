import {NavLink, useLocation, useNavigate} from 'react-router-dom'

import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect} from 'react';
import {toAPITime, fromAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
import Room from "./Room";

function UserReservations() {
    const page_name = "Reservations"

    return (
        <ContentWrapper page_name = {page_name}>
            <div>
                Здесь пока пусто
            </div>
        </ContentWrapper>
    )
}

export default UserReservations;