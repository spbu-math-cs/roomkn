import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect} from "react";
import './Footer.css'
import {BottomNavigation, BottomNavigationAction, Paper} from "@mui/material";
import MapIcon from '@mui/icons-material/Map';
import SchoolIcon from '@mui/icons-material/School';

export function Footer() {
    const location = useLocation()
    const navigate = useNavigate()

    const [value, setValue] = React.useState(-1);

    const paths = ["/", "/map", "/my-reservations"]

    useEffect(() => {
        if (location.pathname === "/")
            setValue(0)
        else if (location.pathname === "/map")
            setValue(1)
        else if (location.pathname === "/my-reservations")
            setValue(2)
        else
            setValue(-1)
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: {xs: '', md: 'none'}}} elevation={3}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    navigate(paths[newValue], {replace: true})
                }}
                data-test-id="bottom-navigation"
            >
                <BottomNavigationAction label="Rooms" icon={<SchoolIcon />} />
                <BottomNavigationAction label="Map" icon={<MapIcon />} />
                <BottomNavigationAction label="Reservations" icon={<MapIcon />} />
            </BottomNavigation>
        </Paper>
    )
}