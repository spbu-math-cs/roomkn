import './Navbar.css';
import React, {useContext, useEffect} from "react";


import {NavLink} from "react-router-dom";
import {CurrentUserContext, IsAuthorizedContext, useLogout} from "./Auth";
import {Paper} from "@mui/material";

const NavSignIn = () => {
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {currentUser} = useContext(CurrentUserContext)

    const {triggerLogout, finished, statusCode} = useLogout()

    const logOut = () => {
        triggerLogout()
        // browser.cookies.remove('_xsrf');
    }

    useEffect(() => {
        if (finished) {
            if (statusCode === 200) {
                alert("You successfully logged out")
            } else if (statusCode === 401) {
                alert("Authorization cookies are not present, expired or incorrect!")
            } else {
                alert("Status code: " + statusCode)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    let user_nickname = currentUser?.username
    if (user_nickname == null) {
        user_nickname = "Azat"
    }

    if (isAuthorized) {
        return (
            <>
                <NavLink to="/my-reservations" className="navlink">
                    My reservations
                </NavLink>
                <NavLink to="/profile" className="navlink">
                    {user_nickname}
                    <img className="navbar-profile-avatar" src="/azat.png" alt="avatar"/>
                </NavLink>
                <div onClick={logOut} className="navlink">
                    Logout
                </div>
            </>
        )
    } else {
        return (
            <>
                <NavLink to="/sign-in" className="navlink">
                    Sign In
                </NavLink>
                <NavLink to="/sign-up" className="navlink">
                    Sign Up
                </NavLink>
            </>
        )
    }
}

const Navbar = () => {
    return (
        <Paper elevation={15}>
            <nav className='nav'>
                <div className='nav-logo-wrapper'>
                    <img src="/logo512.png" alt="MKN logo dark" className="nav-logo"/>
                </div>

                <div className='nav-link-wrapper'>
                    <div className="navdiv">
                        <div className="navbar-left">
                            <NavLink to="/" className="navlink">
                                Classrooms
                            </NavLink>
                            <NavLink to="/about" className="navlink">
                                About
                            </NavLink>
                            <NavLink to="/admin/panel" className="navlink">
                                Admin panel
                            </NavLink>
                        </div>
                        <div className="navbar-right">
                            <NavSignIn/>
                        </div>
                    </div>
                </div>

            </nav>
        </Paper>
    );
};

export default Navbar;