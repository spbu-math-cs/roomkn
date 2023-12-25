import ContentWrapper from "../../components/Content";
import {NavLink} from "react-router-dom";
import AdminWrapper from "../../components/AdminWrapper";
import React, {useContext} from "react";
import {CurrentUserPermissionsContext} from "../../components/Auth";
import {List, ListItem} from "@mui/material";

export function AdminPanel() {
    const {currentUserPermissions} = useContext(CurrentUserPermissionsContext)

    const rooms_display = (currentUserPermissions.indexOf("RoomsAdmin") > -1) ? "" : "none"
    const users_display = (currentUserPermissions.indexOf("UsersAdmin") > -1) ? "" : "none"
    const reservations_display = (currentUserPermissions.indexOf("ReservationsAdmin") > -1) ? "" : "none"
    const map_display = ''
    const tokens_display = (currentUserPermissions.indexOf("UsersAdmin") > -1) ? "" : "none"

    return (
        <AdminWrapper>
            <ContentWrapper page_name="Admin panel">
                <List>
                    <ListItem sx={{display: rooms_display}}>
                        <NavLink to="/admin/rooms" className="navlink">
                            Room list
                        </NavLink>
                    </ListItem>
                    <ListItem sx={{display: users_display}}>
                        <NavLink to="/admin/users" className="navlink">
                            User list
                        </NavLink>
                    </ListItem>
                    <ListItem sx={{display: reservations_display}}>
                        <NavLink to="/admin/reservations" className="navlink">
                            Reservation list
                        </NavLink>
                    </ListItem>
                    <ListItem sx={{display: map_display}}>
                        <NavLink to="/admin/map" className="navlink">
                            Map
                        </NavLink>
                    </ListItem>
                    <ListItem sx={{display: tokens_display}}>
                        <NavLink to="/admin/invites" className="navlink">
                            Invite links
                        </NavLink>
                    </ListItem>
                </List>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminPanel