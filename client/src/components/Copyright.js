import {Typography} from "@mui/material";
import {NavLink} from "react-router-dom";
import React from "react";

export function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <NavLink color="inherit" to="https://roomkn.kpnn.ru/">
                Tod87et team
            </NavLink>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default Copyright;